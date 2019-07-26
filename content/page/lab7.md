+++
title= "lab 7"
description= "Going serverless with ECS Fargate"
draft = false
weight = -94
+++

### Objectives

The objective of this lab is to take our new docker image and host it using ECS Fargate. Once this lab is finished we will be running a fully serverless application. This lab includes:

- Update our CloudFormation Template to include Fargate and an load balancer
- Update our CodePipeline to update Fargate when our code changes
- Finally, turn off the initial web server as we don't need it any more

#### Reference Architecture

[![/img/arch/arch7.png](/img/arch/arch7.png)](/img/arch/arch7-big.png)

### Lab Guide

#### Setup Fargate

Fargate needs permission to execute and to access various resources

1) Open / switch to the CloudFormation infra.yml template you have been working on in the previous labs in your favourite text editor.

2) Add the following role definition between the APIPipeline and the Outputs section.

```
  FargateRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              Service:
              - ecs-tasks.amazonaws.com
            Action:
              - sts:AssumeRole
      Path: /
      Policies:
        - PolicyName: AllowEverything
          PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Effect: Allow
                Action: '*'
                Resource: '*'
```

3) Fargate needs a cluster of servers to execute in. As AWS will manage all the servers for us, we simply need to define a cluster. Add the following between the new FargateRole and the Outputs section.

```
  APICluster:
    Type: AWS::ECS::Cluster
```

4) Fargate also needs a log group to write it's logs into. Add the following between the new APICluster and the Outputs section.

```
  APILogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: !Join ['', ['/ecs/', !Ref 'AWS::StackName', '/APITask'] ]
      RetentionInDays: 14
```

5) The Application Load Balancer needs to be able to route traffic through to our Fargate nodes, so we need to add another Security Group. Add the following between the new APILogGroup and the Outputs section.

```
  FargateSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Access to our fargate containers
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: '3000'
          ToPort: '3000'
          SourceSecurityGroupId: !Ref PublicSecurityGroup
      VpcId: !Ref VPC
```

6) The Fargate node also needs to be able to access the Aurora database. Add a new ingress rule to the existing PrivateSecurityGroup. Add the following above the Tags in the PrivateSecurityGroup.

```
      - IpProtocol: tcp
        FromPort: '3306'
        ToPort: '3306'
        SourceSecurityGroupId: !Ref FargateSecurityGroup
```

#### Defining the Fargate task

Fargate uses task definitions to define all the attributes used when running Docker images in Fargate. Firstly we define the task and then use a service to tell Fargate to run the task definition on the Cluster.

7) Add the following task definition between the FargateSecurityGroup and the Outputs section. You will need to update the task definition to reference your ECR repository. Update the Image: IMAGENAME by replacing IMAGENAME with the ECR URL you copied in the last lab.

__Ensure you have changed the IMAGENAME__. If you do not, your stack will not be able to start and may block for up to 1 hour.

```
  APITask:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Essential: true
          Image: IMAGENAME
          Name: !Join ['', [!Ref 'AWS::StackName', 'APIContainer'] ]
          LogConfiguration:
            LogDriver: awslogs
            Options:
              awslogs-group: !Ref APILogGroup
              awslogs-region: !Ref AWS::Region
              awslogs-stream-prefix: ecs
          PortMappings:
            - HostPort: 3000
              Protocol: tcp
              ContainerPort: 3000
      Cpu: 512
      Memory: '1024'
      ExecutionRoleArn: !Ref FargateRole
      TaskRoleArn: !Ref FargateRole
      Family: !Join ['', [!Ref 'AWS::StackName', 'APITask'] ]
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
```

8) Next we need to define the service that will cause Fargate to start our docker image. Add the following between the APITask and the Outputs section.

```
  APIService:
    Type: AWS::ECS::Service
    DependsOn:
      - APIALB
      - APIALBListener
    Properties:
      Cluster: !Ref APICluster
      DeploymentConfiguration:
        MaximumPercent: 200
        MinimumHealthyPercent: 100
      DesiredCount: 2
      HealthCheckGracePeriodSeconds: 15
      LaunchType: FARGATE
      LoadBalancers:
        - ContainerName: !Join ['', [!Ref 'AWS::StackName', 'APIContainer'] ]
          ContainerPort: 3000
          TargetGroupArn: !Ref APIALBTG
      NetworkConfiguration:
        AwsvpcConfiguration:
          AssignPublicIp: ENABLED
          SecurityGroups:
            - !Ref FargateSecurityGroup
          Subnets:
            - !Ref PublicSubnetA
            - !Ref PublicSubnetB
      TaskDefinition: !Ref APITask
```

#### Using an Application Load Balancer (ALB)

The Application Load Balancer (ALB) is used to receive incoming requests and route them to a copy of the running Docker image in Fargate. To use an ALB we need to define three components. The actual ALB instance, a listener and a target group. The ALB hosts both the listener and target group. The listener defines what port to listen on, in our case HTTP on port 80. It then sends the traffic to the target group.

9) To add a load balancer add the following between the APIService and the Outputs section.

```
  APIALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      IpAddressType: ipv4
      Name: !Join ['', [!Ref 'AWS::StackName', 'APIALB'] ]
      Scheme: internet-facing
      SecurityGroups:
        - !Ref PublicSecurityGroup
      Subnets:
        - !Ref PublicSubnetA
        - !Ref PublicSubnetB
      Type: application
```

10) Next we add the listener. Add the following between the APIALB and the Outputs section.

```
  APIALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - TargetGroupArn: !Ref APIALBTG
          Type: forward
      LoadBalancerArn: !Ref APIALB
      Port: 80
      Protocol: HTTP
```

11) Lastly, we add the target group. Add the following between the APIALBListener and the Outputs section.

```
  APIALBTG:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    DependsOn: APIALB
    Properties:
      HealthCheckEnabled: true
      HealthCheckIntervalSeconds: 15
      HealthCheckPath: /api/health
      HealthCheckProtocol: HTTP
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 5
      Matcher:
        HttpCode: '200'
      Name: !Join ['', [!Ref 'AWS::StackName', 'APIALBTG'] ]
      Port: 80
      Protocol: HTTP
      TargetType: ip
      UnhealthyThresholdCount: 2
      VpcId: !Ref VPC
```

#### Update CloudFront

Now that we have our Fargate servers setup, we need to update our CloudFront distribution to route traffic to the new service.

12) In the CFDistribution we need to make two changes. Firstly, locate the line that reads:

```
            TargetOriginId: EC2-Endpoint
```

and change it to read:

```
            TargetOriginId: Fargate-Endpoint
```

13) Next we will add a new Origin. Add the following block directly below the Origins: line in the CFDistribution.

```
          -
            CustomOriginConfig:
              OriginProtocolPolicy: http-only
            DomainName:
              Fn::GetAtt:
                - APIALB
                - DNSName
            Id: Fargate-Endpoint
```

14) As we don't need the server origin, remove the following block from the Origins: section in the CFDistribution.

```
          -
            CustomOriginConfig:
              OriginProtocolPolicy: http-only
            DomainName:
              Fn::GetAtt:
                - WebServer
                - PublicDnsName
            Id: EC2-Endpoint
```

#### Decommission our last server

15) Now that we have moved our API into Fargate serverless, we can remove our EC2 instance. Locate the WebServer in our infra.yml and delete it. You need to delete the following block:

```
  WebServer:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", AMI]
      InstanceType: t3.medium
      IamInstanceProfile: !Ref DeployRoleProfile
      KeyName: !Ref KeyName
      NetworkInterfaces:
        - AssociatePublicIpAddress: true
          DeviceIndex: 0
          GroupSet:
            - Ref: PublicSecurityGroup
          SubnetId:
            Ref: PublicSubnetA
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::WebServer'] ]
      UserData:
        Fn::Base64:                                # YAML makes userdata much cleaner
          !Sub |
              #!/bin/bash
              echo ==== Starting UserData Script ====
              curl -k -o /root/setup.sh http://d3eglt6sb590rd.cloudfront.net/assets/setup.sh
              chmod +x /root/setup.sh
              sudo -i /root/setup.sh
              echo ==== Finished UserData Script ====
```

16) Now that the WebServer has been removed, we also need to remove the output that was referencing the WebServer. In the Outputs sections, remove the URL output. Delete the following block:

```
  URL:
    Value:
      Fn::Join:
      - ''
      - - http://
        - Fn::GetAtt:
          - WebServer
          - PublicIp
    Description: Lab 1 application URL
```

#### Update the build process

17) As we will be building the Docker image using Code Pipeline we need to update the APIBuildProject to include the Fargate cluster and service details. In the APIBuildProject we need to add three additional environment variables. Add the following to the EnvironmentVariables section of the APIBuildProject directly above the Artifacts.

```
          -
            Name: CLUSTER
            Type: PLAINTEXT
            Value: !Ref APICluster
          -
            Name: SERVICE
            Type: PLAINTEXT
            Value: !GetAtt APIService.Name
          -
            Name: DISTRIBUTIONID
            Type: PLAINTEXT
            Value: !Ref CFDistribution
```

18) Save the changes to your infra.yml file and create a zip file containing the updated infra.yml.

Did you know you could do all of this via the CLI? or had you worked that out by now?
```
zip infra.yml.zip infra.yml
aws s3 cp infra.yml.zip s3://your-tsagallery.companyname.com/cloudformation/infra.yml.zip
```

19) Back in AWS console, select the S3 service.

20) Select our data bucket. Click Upload and drop the infra.yaml.zip file from step 18 onto the upload screen. Click Upload. This will update our CloudFormation stack. Once the update has finished, we can test the site using the CloudFront distribution URL.

21) We also need to update the buildspec.yml file so that it will update the running Fargate images after each build. Select the Cloud9 service and click Open IDE to re-open the editor.

22) Add another blank line on line 26 after docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:latest and insert the following block into the blank line:

```
      - aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment
      - while true; do aws ecs wait services-stable --cluster $CLUSTER --service $SERVICE > /dev/null && break; sleep 2; done
      - INVALIDATIONID=$(aws cloudfront create-invalidation --distribution-id $DISTRIBUTIONID --paths /\* --query Invalidation.Id --output text)
      - aws cloudfront wait invalidation-completed --distribution-id $DISTRIBUTIONID --id $INVALIDATIONID
``` 

These additional lines use the command line tools to update the Fargate containers with the newer version of the docker image, then kicks off a CloudFront invalidation. The invalidation causes CloudFront to discard any cached versions. In a production system, doing a blanket invalidation is not recommended. Rather, versioned URIs should be used wherever possible.

23) Save the changes and in the bash panel at the bottom of the screen, commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git commit -a -m "Update Buidlspec to update-service"
git push
```

### Wrap-up

In this lab we have taken the Docker image we built in the previous lab and deployed it using serverless Fargate. We updated the CloudFront distribution to use this new deployment and we terminated our initial server as we don't need it anymore.

### Clean-up

To remove the resources you have created thus far:

1) Select the S3 service. You will need to empty the DataBucketName bucket, along with the pipeline artifacts buckets. These will named like tsa-bootstrap-pipelineartifacts-????? and *tsagallery-pipelineartifacts-?????**. You can empty a bucket using the Empty button after selecting the bucket in S3.

2) Select the Cloud9 service. Then select the Cloud9 instance and click the Delete button. When prompted, enter Delete in the input box and click Delete.

3) Select the CloudFormation service.

4) Select the TSAGallery stack by clicking the selection circle. The row will highlight blue.

5) Using the Actions menu, select Delete stack.

6) When prompted, click Delete.

This will delete all the resources that were created using the main CloudFormation template.

7) Use the same Delete stack method used on the TSAGallery stack to delete the TSA-Bootstrap stack.

8) While CloudFormation is deleting your stack, it will delete the RDS Database. However, it will first create a snapshot which will remain after the stack has been deleted. To delete any snapshots;
       
 - Select the RDS service.
 - Select Snapshots from the left hand menu.
 - Check the tickbox next to each snapshot you wish to delete, and click Actions then Delete Snapshot.
 - When prompted, click Delete to delete the snpashots.

### Talking points

- Blue/Green Deployments
- How to avoid cache invalidations

#### Assets

**[infra-lab7.yml](/assets/cloudformation/infra-lab7.yml)**
