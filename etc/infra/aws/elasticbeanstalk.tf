data "aws_iam_policy_document" "assume_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "permissions" {
  statement {
    actions = [
      "cloudwatch:PutMetricData",
      "ec2:DescribeInstanceStatus",
      "ssm:*",
      "ec2messages:*",
      "s3:*",
      "sqs:*"
    ]
    resources = ["*"]
  }
}

# This is required to spin up containers in EB environment
# Create instance profile
resource "aws_iam_instance_profile" "ec2_eb_profile" {
  name = format("%s-%s-ec2-profile", var.app_name, var.app_env)
  role = aws_iam_role.ec2_role.name
  tags = local.tags
}

resource "aws_iam_role" "ec2_role" {
  name               = format("%s-%s-ec2-role", var.app_name, var.app_env)
  assume_role_policy = data.aws_iam_policy_document.assume_policy.json
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier",
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker",
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier",
    "arn:aws:iam::aws:policy/EC2InstanceProfileForImageBuilderECRContainerBuilds"
  ]

  inline_policy {
    name   = "eb-application-permissions"
    policy = data.aws_iam_policy_document.permissions.json
  }
  tags = local.tags
}

#
# Create Elastic Beanstalk application
# Actual Elastic Beanstalk configuraation
#
resource "aws_elastic_beanstalk_application" "eb_application" {
  name        = format("%s-%s-eb-application", var.app_name, var.app_env)
  description = format("%s CCRP backend", var.app_name)
  tags        = local.tags
}

resource "aws_elastic_beanstalk_application_version" "eb_version" {
  name        = local.docker_run_config_sha
  application = aws_elastic_beanstalk_application.eb_application.name
  description = "Carbonable CCRP Backend"
  tags        = local.tags
  bucket      = aws_s3_bucket.docker_run_bucket.bucket
  key         = aws_s3_object.docker_run_object.id
  depends_on  = [aws_s3_object.docker_run_object]
}

resource "aws_elastic_beanstalk_environment" "eb_environment" {
  depends_on  = [docker_registry_image.image_registry]
  name        = format("%s-%s-eb-environment", var.app_name, var.app_env)
  application = aws_elastic_beanstalk_application.eb_application.name
  # list of version available with this command : aws elasticbeanstalk list-platform-versions --query 'PlatformSummaryList[*].PlatformArn'
  platform_arn  = "arn:aws:elasticbeanstalk:eu-west-3::platform/Docker running on 64bit Amazon Linux 2023/4.3.6"
  version_label = aws_elastic_beanstalk_application_version.eb_version.name
  cname_prefix  = format("%s-%s", var.app_name, var.app_env)
  tags          = local.tags

  # Set required environment variables for container
  dynamic "setting" {
    for_each = var.environment_variables
    content {
      namespace = "aws:elasticbeanstalk:application:environment"
      name      = setting.key
      value     = setting.value
    }
  }

  # Settings namespace list : https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/command-options-general.html
  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBEngine"
    value     = "postgres"
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBAllocatedStorage"
    value     = "20"
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "HasCoupledDatabase"
    value     = "true"
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBDeletionPolicy"
    value     = "Snapshot"
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBEngineVersion"
    value     = "16.3"
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBInstanceClass"
    value     = local.db_instance_class
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBUser"
    value     = local.db_username
  }

  setting {
    namespace = "aws:rds:dbinstance"
    name      = "DBPassword"
    value     = local.db_password
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.ec2_eb_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = var.max_instance_count
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "MatcherHTTPCode"
    value     = 200
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/healthz"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "RetentionInDays"
    value     = "7"
  }

  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "DeleteOnTerminate"
    value     = "false"
  }
}
