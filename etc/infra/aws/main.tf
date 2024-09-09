terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "3.0.2"
    }

    local = {
      source  = "hashicorp/local"
      version = "2.5.1"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "2.5.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.6.2"
    }
  }

  backend "s3" {
    bucket = "carbonable-deployments-backends"
  }
}

# Configure the AWS Provider this is recommanded to first create a deployer account on the aws console
# then use this profile to use aws cli and therefore terraform
provider "aws" {
  # region needs to be hardcoded. Paris is default region
  region  = var.aws_region
  profile = var.aws_profile
}

# Configure docker provider to use ECR
provider "docker" {
  registry_auth {
    address  = local.aws_ecr_url
    username = data.aws_ecr_authorization_token.token.user_name
    password = data.aws_ecr_authorization_token.token.password
  }
}

data "aws_availability_zones" "az" {}
data "external" "git_commit" {
  program = ["git", "log", "--pretty=format:{ \"sha\": \"%H\" }", "-n 1"]
}

resource "random_password" "db_password" {
  length  = 32
  special = false
}

locals {
  tags = {
    App             = "ccrp"
    Env             = var.app_env
    EnvironmentName = var.app_env
    Name            = var.app_name
    Client          = var.app_name
    DeploymentType  = "Automatic"
  }

  vpc_cidr = "10.0.0.0/16"
  azs      = slice(data.aws_availability_zones.az.names, 0, 3)

  aws_ecr_url           = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com"
  docker_run_config_sha = sha256(local_file.docker_run_config.content)

  db_username       = "${var.app_name}${var.app_env}"
  db_password       = random_password.db_password.result
  db_instance_class = "db.t3.micro"

  #  db_url = "postgresql://${local.db_username}:${local.db_password}@${aws_elastic_beanstalk_environment.}/${local.db_name}"

  docker_image_tagged_latest = "${aws_ecr_repository.repository.repository_url}:latest"
  docker_image_tagged_commit = "${aws_ecr_repository.repository.repository_url}:${data.external.git_commit.result.sha}"
}

