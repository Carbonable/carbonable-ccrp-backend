data "aws_caller_identity" "current" {}
data "aws_ecr_authorization_token" "token" {}

# Create ERC repository to host built docker images
resource "aws_ecr_repository" "repository" {
  name = format("%s-%s", var.app_name, var.app_env)
  tags = local.tags
}

# Build docker image
resource "docker_image" "image" {
  name = aws_ecr_repository.repository.repository_url

  build {
    context = "../../../"
    tag = [
      "latest",
      data.external.git_commit.result.sha,
    ]

    target   = "aws_runtime"
    platform = "linux/amd64"
  }


  # Triggers build image when src folder changes
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(path.module, "../../../*") : filesha1(f)]))
  }
}
resource "docker_tag" "image_latest" {
  source_image = docker_image.image.name
  target_image = local.docker_image_tagged_latest
}
resource "docker_tag" "image_commit" {
  source_image = docker_image.image.name
  target_image = local.docker_image_tagged_commit
}
resource "docker_registry_image" "image_registry" {
  name = docker_image.image.name
}

# Creates a Dockerrun.aws.json file
resource "local_file" "docker_run_config" {
  depends_on = [docker_image.image]
  content = jsonencode({
    AWSEBDockerrunVersion = "1"
    Image = {
      Name   = local.docker_image_tagged_latest
      Update = "true"
    }
    Ports = [{
      ContainerPort = 8080
      HostPort      = 80
    }]
  })
  filename = "${path.module}/Dockerrun.aws.json"
}

resource "local_file" "migration_ebextension" {
  content  = <<-EOT
files:
  "/opt/elasticbeanstalk/hooks/appdeploy/post/01_app_release.sh":
    mode: "000755"
    owner: root
    group: root
    content: |
      #!/usr/bin/env bash
      if [ -f /tmp/leader_only ]; then
        echo "Running Migrations"
        container_id=`docker ps -q --no-trunc --filter label="com.amazonaws.ecs.container-name=${var.app_name}-${var.app_env}"`
        docker inspect $container_id
        docker exec $container_id /entrypoint.sh npx prisma migrate deploy
      fi
container_commands:
  01_touch_the_leader:
    command: |
      #!/usr/bin/env bash
      touch /tmp/leader_only
    leader_only: true
  EOT
  filename = "${path.module}/../../../.ebextensions/01_app_release.config"
}

# Compress file to upload to s3 bucket that will be used as source for elastic beanstalk
data "archive_file" "docker_run" {
  type        = "zip"
  output_path = "${path.module}/Dockerrun.aws.zip"

  source {
    content  = local_file.docker_run_config.content
    filename = local_file.docker_run_config.filename
  }

  source {
    content  = file("${path.module}/../../../.ebextensions/00_rds_env.config")
    filename = ".ebextensions/00_rds_env.config"
  }

  source {
    content  = local_file.migration_ebextension.content
    filename = ".ebextensions/01_app_release.config"
  }
}

# Dockerrun.aws.json config file bucket storage
resource "aws_s3_bucket" "docker_run_bucket" {
  bucket = "${var.app_name}-${var.app_env}-docker-run-bucket"

  tags = local.tags
}
resource "aws_s3_bucket_server_side_encryption_configuration" "docker_run_bucket_encryption" {
  bucket = aws_s3_bucket.docker_run_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Create s3 object from the compressed docker run config
resource "aws_s3_object" "docker_run_object" {
  key    = "${local.docker_run_config_sha}.zip"
  bucket = aws_s3_bucket.docker_run_bucket.id
  source = data.archive_file.docker_run.output_path
  tags   = local.tags
}
