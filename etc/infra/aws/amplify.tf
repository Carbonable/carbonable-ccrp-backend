resource "aws_amplify_app" "frontend" {
  name = "${var.app_name}-frontend"
  repository = "https://github.com/carbonable/ccrp-front"
  access_token = var.github_access_token

  build_spec = <<-EOT
    version: 0.1
    frontend:
      phases:
        preBuild:
          commands:
            - yarn install
        build:
          commands:
            - yarn run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
EOT

  environment_variables = {
    BACKEND_URL = aws_elastic_beanstalk_environment.eb_environment.endpoint_url
  }
}

resource "aws_amplify_branch" "main" {
  app_id = aws_amplify_app.frontend.id
  branch_name = "main"
  stage = "PRODUCTION"
}

resource "aws_amplify_webhook" "main_trigger" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "triggermaster"
}
