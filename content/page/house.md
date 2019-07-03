+++
title= "House Keeping / Next Steps"
description= ""
draft = false
weight = -89
+++
### House Keeping

So we've built a full solution and each step had instructions to clean up your account. Just for good practice lets manually check our resources to make sure everything is cleaned up and deleted.

Its good to check for these items:

- Check cloudformation stacks are deleted and haven't failed
- Check S3 buckets are emptied and/or deleted
- Check CodeCommit repo's deleted
- Check CodePipelines deleted
- Check Aurora is deleted and no snapshots left
- Check DynamoDB tables are deleted
- Check EC2 + Load Balancers are deleted
- Check Fargate Taks and Serverices are deleted and ECS cluster is Deleted
- Check Lambda functions are deleted
- Check SNS Topics and SQS Queues are deleted

### Next Steps

- Try the labs again at home or work to get more of a feel for the services.
- Experiment with moving out more features into Lambda
- Play with autoscaling the Fargate Tasks
- Look at CloudWatch Monitoring actions

And as always we are looking for feed back so please open pull requests and issues on github.