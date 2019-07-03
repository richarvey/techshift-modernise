+++
title= "Lab 2"
description= "Improving your solution with a landing zone and CI/CD"
draft = false
weight = -105
+++

## Objectives
The objective of this lab is build a solid base we can use to modernise your application. This lab includes:

 - Updating our CloudFormation template to include the additional Availability Zones and add private Subnets to host our private resources.
 - Using S3 as a versioned repository for our CloudFormation templates.
 - Using CodePipeline to deploy our updated CloudFormation template into our VPC.

### Lab Guide
Login to your AWS Console.

Ensure you have selected the region you are using for this program.
Updating the CloudFormation Template
Open the CloudFormation template you downloaded in the previous lab in your favourite text editor. If you don't have a text editor, Visual Studio Code is a good programmers editor. It can be downloaded from https://code.visualstudio.com/ for Windows, Mac and Linux. If you don't have the template, it can be copied from the Lab 1 documentation.
Add a second public subnet in between PublicSubnetA and 


```
PublicRouteTable
  PublicSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Select 
        - 1
        - Fn::GetAZs: !Ref 'AWS::Region'
      VpcId: !Ref VPC
      CidrBlock: 10.11.16.0/20
      MapPublicIpOnLaunch: false
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::PublicSubnetB'] ]
```

Associate the public routing table to the new public subnet between 

```
PublicSubnetARouteTableAssociation and PublicSecurityGroup
  PublicSubnetBRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnetB
```

Add our private Subnets, Route tables and Security Groups between PublicSecurityGroup and ServerRole

```
#Private Subnet
  PrivateSubnetA:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Select 
        - 0
        - Fn::GetAZs: !Ref 'AWS::Region'
      VpcId: !Ref VPC
      CidrBlock: 10.11.32.0/20
      MapPublicIpOnLaunch: true
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::PrivateSubnetA'] ]

  PrivateSubnetB:
    Type: AWS::EC2::Subnet
    Properties:
      AvailabilityZone: !Select 
        - 1
        - Fn::GetAZs: !Ref 'AWS::Region'
      VpcId: !Ref VPC
      CidrBlock: 10.11.48.0/20
      MapPublicIpOnLaunch: true
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::PrivateSubnetB'] ]

  PrivateRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::PrivateRouteTable'] ]

  PrivateSubnetARouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnetA

  PrivateSubnetBRouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnetB

  PrivateSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref VPC
      GroupDescription: Enable database access
      SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: '3306'
        ToPort: '3306'
        SourceSecurityGroupId: !Ref PublicSecurityGroup
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::PrivateSecurityGroup'] ]
```

Save your changes. You can use [https://text-compare.com/](https://text-compare.com/) to compare your version with the updated version of the CloudFormation template at the bottom of this document.

Deploy the CloudFormation changes using CodePipeline
In order to deploy the CloudFormation changes for our TSAGallery we will be using CodePipeline, however as we are embracing infrastructure as code, we will setup the CodePipeline using CloudFormation. This will be our BootStrap stack with which we can then automate the remainder of our environment.

Create the BootStrap CloudFormation template

Create a new blank document in your favourite text editor. Add each of the following sections to the end of the document.

__Note:__ Indentation is important in CloudFormation and the code snipits must be copied exactly as they appear, including leading spaces.

Add the CloudFormation version line.

```
AWSTemplateFormatVersion: 2010-09-09
```

Add the parameters that will control the creation of the resources:

- KeyName and SSHLocation will be used as a parameter for the main template we edited above.
- ChildStackName is the name of the stack used to initalise your account. This will be TSAGallery unless you changed it in Lab0.
- DataBucketName is the location we will be storing the resources for the main stack including the CloudFormation template.

```
Parameters:
  KeyName:
    Description: Name of an existing EC2 KeyPair to enable SSH access to the instance
    Type: AWS::EC2::KeyPair::KeyName
    ConstraintDescription: can contain only ASCII characters.

  SSHLocation:
    Description: 'The IP address range that can be used to SSH to the EC2 instances'
    Type: String
    MinLength: '9'
    MaxLength: '18'
    AllowedPattern: '(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/(\d{1,2})'
    ConstraintDescription: must be a valid IP CIDR range of the form x.x.x.x/x.
    Default: 0.0.0.0/0

  ChildStackName:
    Description: The name for the CloudFormation stack that will be created and updated by this CodePipeline
    Type: String
    MinLength: '5'
    MaxLength: '18'
    Default: TSAGallery
  
  DataBucketName:
    Description: The name for the S3 Bucket the will store the data
    Type: String
    MinLength: '3'
    MaxLength: '63'
    AllowedPattern: '(?=^.{3,63}$)(?!^(\d+\.)+\d+$)(^(([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$)'
    Default: tsagallery.companyname.com
```

Add the first resource, a new IAM role that will be used by CloudFormation and CodePipeline to manage your main stack.

```
Resources:
  PipelineRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - codepipeline.amazonaws.com
                - cloudformation.amazonaws.com
                - codebuild.amazonaws.com
            Action: sts:AssumeRole
      Policies:
        - PolicyName: CloudPipelinePolicy
          PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Effect: Allow
                Action: "*"
                Resource: "*"
                
```

Add the two S3 buckets we will need. The first is our data bucket. This will store all the assets for the system. The second is used by CodePipeline to store artifacts during the pipeline execution.

```
  StackData: 
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Ref DataBucketName
      VersioningConfiguration:
        Status: Enabled

  PipelineArtifacts:
    Type: AWS::S3::Bucket
```

Add the CodePipeline body.

```
  Pipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: !Join ['', [!Ref 'AWS::StackName', '-Pipeline'] ]
      ArtifactStore:
        Type: S3
        Location: !Ref PipelineArtifacts
      RoleArn: !GetAtt [PipelineRole, Arn]
      Stages:
```
      
Add a stage to pull the updates from the metadata bucket as the source.

```
        -
          Name: Source
          Actions:
            -
              Name: SourceAction
              RunOrder: 1
              ActionTypeId:
                Category: Source
                Owner: AWS
                Version: 1
                Provider: S3
              Configuration:
                S3Bucket: !Ref DataBucketName
                PollForSourceChanges: true
                S3ObjectKey: cloudformation/infra.yaml.zip
              OutputArtifacts:
                - Name: SourceArtifact
```
     
Add a stage to deploy the SourceArtifact using CloudFormation. a SourceArtifact is the name given to the source template inside CodePipeline.

```
        -
          Name: Deploy
          Actions:
            -
              Name: DeployAction
              RunOrder: 2
              InputArtifacts:
                - Name: SourceArtifact
              ActionTypeId:
                Category: Deploy
                Owner: AWS
                Version: 1
                Provider: CloudFormation
              Configuration:
                ActionMode: CREATE_UPDATE
                RoleArn: !GetAtt [PipelineRole, Arn]
                Capabilities: CAPABILITY_IAM,CAPABILITY_NAMED_IAM
                StackName: !Ref ChildStackName
                TemplatePath: SourceArtifact::infra.yaml
                ParameterOverrides: 
                  !Sub 
                  - |
                    {
                      "KeyName": "${KeyName}",
                      "SSHLocation": "${SSHLocation}"
                    }
                  - 
                    KeyName: !Ref KeyName
                    SSHLocation: !Ref SSHLocation
```

Lastly, we need to add an output. This will allow us to refer to the data bucket in our other CloudFormation Templates.

```
Outputs:
  StackDataBucket:
    Description: The name of the bucket used to store all the stack assets
    Value: !Ref DataBucketName
    Export:
      Name: !Sub "TSAGallery-DataBucket"
```     

__Note:__ Why do we export the bucket name, but use parameters for the KeyName and SSHLocation? We want to be able to use the same CloudFormation templates for both production and non-production stacks so we ensure the infrastructure is consistant. As the data location would be shared, we can just export the value and import as needed. Non-production stacks should have a seperate key as developers may use thier own keys, and the SSH location could be a more relaxed range of IPs.

Save that file as bootstrap.yaml. The full file can be found at the bottom of this document.

Back in the AWS Console, select the CloudFormation service.
You will need the Key name and SSHLocation for your TSAGallery stack. To find these values;

- Open the AWS Console in a new window.
- Select the CloudFormation service.
- Select the TSAGallery stack and click the Parameters tab.
- The two values needed are listed and should be copied into a tempory file.

Click Create stack.

Select Upload a template file and Choose file. Select the file you saved in step 17. Then click Next.

Enter TSABootstrap as the Stack name.

Leave the ChildStackName as TSAGallery unless you changed the main stack name in Lab 1.

Select the KeyName that matches the Key name in step 19.

Enter a DataBucketName bucket name such as tsagallery.companyname.com. Bucket names must be globally unique. 

One way of ensuring global uniqueness, is to use a DNS name such as tsa-infrastructure.companyname.com. Make a note of this name as you will need it later.

Leave the SSHLocation as 0.0.0.0/0 unless it was changed. See step 

Click Next.

On the Configure stack options page, scroll to the bottom and click Next.

On the Review TSA-Bootstrap page, scroll to the bottom. Click the I acknowledge that AWS CloudFormation might create IAM resources. options and click Create stack.

Deploy the new infra.yaml

Using your local computer, create a zip file containing the updated infra.yaml.

Select the S3 service.

Select the bucket with the name from the DataBucketName in step 24.

Click Create Folder. Enter the folder name cloudformation and click Save. Note: The folder name must be all lowercase

Click on the new cloudformation folder to open it.

Click Upload and drop the Infra.yaml.zip file from step 30 onto the upload screen. Click Upload.

Select the CodePipeline service and select the TSAGallery-Infra Pipeline to confirm it has run. It may take a few minutes to start and run. Both Source and Deploy should now show Succeeded.

Confirm the changes

Select the CloudFormation service, select the TSAGallery stack and click the Resources tab.

You should now be able to see PublicSubnetB, PrivateSubnetA and PrivateSubnetB, along with the supporting route tables and security groups.

#### Wrap-up

In this lab you not only used CloudFormation to setup the landing zone you will use for the remainder of the labs, you also used CodePipeline to automate the deployment of these changes. We will continue to use this Pipeline as we add more services and resources to your account.
Talking points

- We have setup public and private subnets. We can also setup three layers of subnets to better secure our public endpoints.
- Two availablity zones provides high availability, how can we use more availability zones to provide fault tollerance.

#### Cleanup

To remove the resources you have created thus far:

Select the S3 service. You will need to empty the DataBucketName bucket, along with the pipeline artifacts bucket. This will named like tsa-bootstrap-pipelineartifacts-?????. You can empty a bucket using the Empty button after selecting the bucket in S3.

Select the CloudFormation service.

Select the TSAGallery stack by clicking the selection circle. The row will highlight blue.

Using the Actions menu, select Delete stack.

When prompted, click Delete.
This will delete all the resources that were created using the main CloudFormation template.

Use the same Delete stack method used on the TSAGallery stack to delete the TSA-Bootstrap stack.

#### Assets

**[infra-lab2.yml](/assets/cloudformation/infra-lab2.yml)**
