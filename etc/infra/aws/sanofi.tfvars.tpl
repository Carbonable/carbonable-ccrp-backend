# Configure AWS provider
aws_profile = "carbonable_deployer"
aws_region  = "eu-west-3"

# Application variables
app_name = "sanofi"
app_env  = "staging"

environment_variables = {
  JWT_KEY                = "189c982c0554bcb313390dc4b233faefa073696900dc7d85122c9b37cf4cc4ce"
  DEFAULT_ADMIN_NAME     = "admin"
  DEFAULT_ADMIN_PASSWORD = "changeme"
  DEFAULT_ADMIN_ROLES    = "['user', 'admin']"
  CARBONABLE_SALT        = "78860"
}

