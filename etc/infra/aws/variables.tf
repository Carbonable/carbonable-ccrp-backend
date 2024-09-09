variable "aws_profile" {
  type        = string
  description = "AWS profile to use"
}

variable "aws_region" {
  type        = string
  description = "AWS region to use"
  default     = "eu-west-3"
}

variable "github_access_token" {
  type        = string
  description = "Github access token to use"
}

variable "app_name" {
  type        = string
  description = "Name of the application i.e can be the client name"
}

variable "app_env" {
  type        = string
  description = "Environment of the application i.e can be dev, staging, prod"
  default     = "staging"
}

variable "environment_variables" {
  type        = map(any)
  description = "Environment variables to pass to the application"
  default     = {}
}

variable "instance_type" {
  type        = string
  description = "Instance type to use for the EC2 instance"
  default     = "t2.micro"
}
variable "max_instance_count" {
  type        = number
  description = "Maximum number of instances to run"
  default     = 1
}

