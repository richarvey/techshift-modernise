+++
title= "House Keeping / Next Steps"
description= ""
draft = false
weight = -89
+++
### House Keeping

We have built a full solution and each step had instructions to clean up your account. Just for good practice we should manually check our resources to make sure everything is cleaned up and deleted.

It is good to check for these items:

- Check cloudFormation stacks are deleted and have not failed
- Check S3 buckets are emptied and/or deleted
- Check CodeCommit repos deleted
- Check CodePipelines deleted
- Check Aurora is deleted and no snapshots left
- Check DynamoDB tables are deleted
- Check EC2 + Load Balancers are deleted
- Check Fargate Task and Services are deleted and ECS cluster is Deleted
- Check Lambda functions are deleted
- Check SNS Topics and SQS Queues are deleted

### Next Steps

- Try the labs again at home or work to get more of a feel for the services.
- Experiment with moving out more features into Lambda
- Play with Auto Scaling the Fargate Tasks
- Look at CloudWatch Monitoring actions
- Explore <a href="https://aws.amazon.com/cdk/">AWS CDK</a>, an open source software development framework to model and provision your cloud application resources using familiar programming languages

We are looking for feedback on this event and the content, contributions are welcome as GitHub issues or pull requests.
