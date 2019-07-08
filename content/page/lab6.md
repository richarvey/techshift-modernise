+++
title= "Lab 6"
description= "Building our app in Docker"
draft = false
weight = -96
+++

### Objectives

The objective of this lab is to take our existing server based API and build it into a docker container so we can get ready to go fully serverless. This lab includes:

- Setup ECR to store the built application
- Add Dockerfile and build the Docker image
- Test the image on a temporary EC2 instance
- Remove the temporary instance to avoid ongoing costs

#### Reference Architecture

![/img/arch/arch6.png](/img/arch/arch6.png)

### Lab Guide

#### Setup an Elastic Cloud Repository (ECR)

As with the CodeCommit repositories, we will be creating a single repository for storing the build docker images manually. In a production environment, it is common to use a single repository to store all the different builds, then push different builds to your different environments. You may use CodePipeline to build a docker image from your release branch. This new image can be deployed into a QA or a pre-prod environment for testing. Once testing has been signed off, the same build is pushed into the production environment. The image is customised for each environment using environment variables.

1) Open the AWS console in your web browser.

2) Select the ECR service.

3) If this is your first repository, click Get Started under Create a repository. Otherwise, click Create repository to add a new repository.

4) Enter tsa/gallery as the Repository name and click Create repository.

5) Copy the repository URI to a text file as we will need this value later.

#### Setup a health check

In order to use a load balancer we need to setup a endpoint to act as a health check. The health check must return a success state (http status code 200) when the API is ready to accept connections. The load balancer will make requests to the health check after the image is started and at regular intervals to ensure the image is able to accept traffic.

6) Select the Cloud9 service and click Open IDE to re-open the editor.

7) Open the app.js file in the TSAGallery-API folder.

8) On line 35, above the comment // make sure database is connected add 2 new lines, then add the following function in the new space.

```
  app.get('/api/health', async function(req, res, next) {
    //Read the builnum asset
    var buildNum = 0;
    try {
      var fs = require("fs");
      buildNum = fs.readFileSync("buildnum.txt", { encoding: "utf8" });
    } catch (err) {
      console.log("Error: Unable to locate buildnum.txt");
    }
    var result = {
      healthOk: true,
      buildNum: buildNum.trim(),
    }
    res.status(200).send(result);
    return;
  });
```

This adds a handler that responds to the /api/health endpoint and returns 200. In a production environment, this endpoint should do any checks that are needed to ensure the image is functioning correctly.

#### Add the docker build assets to the API

9) Next we need to add two files. Click File, then New File to create an empty file.

10) The first file will be our Dockerfile. This file has the instructions used by docker when we build the image. Copy and paste the following into the empty file.

```
FROM node:11

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
```

11) Click File, then Save As. Ensure the folder is /TSAGallery-API and enter Dockerfile as the new filename. Ensure the D is in capitals and the remaining characters are lowercase.

12) Create a new empty file using File, then New File. Paste the following into this new file.

```
node_modules
npm-debug.log
```

This file tells docker to ignore the node_modules folder and the debug log.

13) Click File, then Save As. Ensure the folder is /TSAGallery-API and enter .dockerignore as the new filename. All the characters are lowercase and it starts with a fullstop.

14) We can now test the build process on Cloud9. Enter the following command:

```
docker build -t test .
```

You will see a number of status lines scroll past. The last line should read Successfully tagged test:latest. In this case our test build has worked. We can remove the test build as follows:

```
docker rmi test:latest
docker rmi node:11
```

15) In the bash panel at the bottom of the screen, add the new files and commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git add .dockerignore 
git add Dockerfile 
git commit -a -m "Add Docker files"
git push
```

#### Add the CodeBuild resources

16) We need to add one more file. Click File, then New File to create an empty file.

17) Copy the following into the new file.

```
version: 0.2
phases:
  install:
    runtime-versions:
      docker: 18
      nodejs: 10
  pre_build:
    commands:
      - echo Logging in to Amazon ECR...
      - $(aws ecr get-login --no-include-email --region $AWS_REGION)
  build:
    commands:
      - echo Build started on `date`
      - echo Building the Docker image...
      - echo Build number set to $BUILD_NUM
      - echo Build hash set to $CODEBUILD_RESOLVED_SOURCE_VERSION
      - echo $BUILD_NUM > buildnum.txt
      - echo $CODEBUILD_RESOLVED_SOURCE_VERSION > buildhash.txt
      - docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:$BUILD_NUM .
      - docker tag $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:$BUILD_NUM $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:latest
  post_build:
    commands:
      - echo Build completed on `date`
      - echo Pushing the Docker image...
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:$BUILD_NUM
      - docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/tsa/gallery:latest
      - npm update
      - node bump_build_number.js $AWS_REGION $BUILD_NUM_PARAMNAME
```

18) Click File, then Save As. Ensure the folder is /TSAGallery-API and enter buildspec.yml as the new filename. All the characters are lowercase. This file is used by CodeBuild to do the actual build. The file can be read as follows:

 - First install Docker version 18 and NodeJs version 10.
 - Then, use the AWS CLI to get credentials for our ECR Repository.
 - Then, use Docker to build the image and tag it for our ECR Repository with the current build number from parameter store.
 - Also tag the build with the latest tag.
 - Then, push the image with both tags to our ECR Repository.
 - Finally, update NodeJS dependencies and run a NodeJS script to increment the build number in parameter store.

$BUILD_NUM, $AWS_ACCOUNT_ID, $AWS_REGION and $BUILD_NUM_PARAMNAME are environment variables that are set by CodeBuild before the build starts.

19) In the bash panel at the bottom of the screen, add the new file and commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git add buildspec.yml
git commit -a -m "Add CodeBuild buildspec"
git push
```

#### Add a CodePipeline to our infra.yaml

20) Open / switch to the CloudFormation infra.yaml template you have been working on in the previous labs in your favourite text editor.

21) Firstly, we need to have a build number for our docker images. Add the following between the DynamoDBCache and the Outputs section.

```
  BuildNumber:
    Type: AWS::SSM::Parameter
    Properties: 
      Name: !Join ['', ['/BuildsNumbers/', !Ref 'AWS::StackName'] ]
      Type: "String"
      Value: "1"
```

22) Next, we need the CodeBuild project that will do the actual build. The build project defines the environment the build will run in, along with the environment variables that will be set before starting the build. Add the following between the BuildNumber and the Outputs section.

```
  APIBuildProject:
    Type: AWS::CodeBuild::Project
    Properties: 
      Name: !Join ['', [!Ref 'AWS::StackName', '-API-Build'] ]
      Source:
        Type: CODEPIPELINE
      Environment: 
        ComputeType: BUILD_GENERAL1_SMALL
        Type: LINUX_CONTAINER    
        Image: aws/codebuild/standard:2.0
        PrivilegedMode: true
        EnvironmentVariables:
          - 
            Name : BUILD_NUM_PARAMNAME
            Type : PLAINTEXT
            Value : !Join ['', ['/BuildsNumbers/', !Ref 'AWS::StackName'] ]
          -
            Name : BUILD_NUM
            Type : PARAMETER_STORE
            Value : !Join ['', ['/BuildsNumbers/', !Ref 'AWS::StackName'] ]
          - 
            Name : AWS_REGION
            Type : PLAINTEXT
            Value : !Ref 'AWS::Region'
          - 
            Name : AWS_ACCOUNT_ID
            Type : PLAINTEXT
            Value : !Ref 'AWS::AccountId'
      Artifacts: 
        Type: CODEPIPELINE
      LogsConfig: 
        CloudWatchLogs:
          Status: ENABLED
          GroupName: !Ref 'AWS::StackName'
          StreamName: build
      ServiceRole : !Ref PipelineRole  
```

23) Lastly, we need a CodePipeline. The CodePipeline consists of two stages. The first stage gets the latest source code from our CodeCommit repository while the second stage kicks of the CodeBuild project with the latest source. Add the following between the APIBuildProject and the Outputs section.

```
  APIPipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: !Join ['', [!Ref 'AWS::StackName', '-API-Pipeline'] ]
      ArtifactStore:
        Type: S3
        Location: !Ref PipelineArtifacts
      RoleArn: !GetAtt [PipelineRole, Arn]
      Stages:
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
                Provider: CodeCommit
              Configuration:
                PollForSourceChanges: false
                BranchName: master
                RepositoryName: TSAGallery-API
              OutputArtifacts:
                - Name: SourceArtifact
        -
          Name: Build
          Actions:
            -
              Name: BuildAction
              RunOrder: 1
              InputArtifacts:
                - Name: SourceArtifact
              ActionTypeId:
                Category: Build
                Owner: AWS
                Version: 1
                Provider: CodeBuild
              OutputArtifacts:
                - Name: BuildArtifact
              Configuration:
                ProjectName: !Ref APIBuildProject
```

24) Save the changes to your infra.yaml file and create a zip file containing the updated infra.yaml.

25) Back in AWS console, select the S3 service.

26) Select our data bucket. Click Upload and drop the infra.yaml.zip file from step 24 onto the upload screen. Click Upload.

27) Select the CodePipeline service and select the TSAGallery-Infra Pipeline to confirm it has run. It may take a few minutes to start and run. Both Source and Deploy should now show Succeeded.

28) We can confirm the pipeline ran all the way through by checking in ECR for a new image. Select the ECR service and then click on the tsa/gallery repository. There should now be one image listed. The image tag will be latest, 1. This means the image has two tags, the latest tag and the 1 tag. As we do more builds, the latest tag will be moved to the newer builds. The 1 tag will stay with this build. Every build will get a new number. This allows us to reference both the latest build, but also any build by build number.

29) We can also confirm that the build number has been incremented by selecting the Systems Manager service and then clicking Parameter Store from the left hand menu. Then click on the /BuildNumbers/TSAGallery parameter name. The Value shown should now read 2. This means the next build we do will be number 2.

#### Test our new Docker image on a test instance

30) Select the EC2 service and click Launch Instance.

31) Click Select for the Amazon Linux 2 AMI (HVM), SSD Volume Type row.

32) Leave the t2.micro row selected and click Next: Configure Details.

33) For the Network, select the TSAGallery::VPC, and ensure the TSAGallery::PublicSubnetA is selected for the Subnet.

34) Click Next: Add Storage, then click Next: Add Tags.

35) Click Add Tag. Enter a Key of Name and a Value of TempServer.

36) Click Next: Configure Security Group.

37) Select Select an existing security group and select the TSAGallery-PublicSecurityGroup-xxx security group. Then click Review and Launch.

38) Click Launch. Select the tsa-region key pair we are using for this lab. Tick the box to acknowledge that I have access to the selected private key and click Launch Instances.

39) Click View Instances to view all your instances. The new instance will show an Instance State of Pending or Running.

40) SSH into your temporary server. You will need the certificate you created in lab 1.

 - Tick the box next to the TempServer.
 - Click Connect to get the connection instructions.

41) We need to install Docker to run our test. Enter the following commands:

```
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
```

42) For the permission changes to take effect, you need to logout and then re-login. Logout by pressing Ctrl+D or use the logout command. Next reconnect to the server using the same steps as in step 40. Now we can test docker is working.

```
docker info
```

43) Before we can start using ECR, we need permission to access ECR from this server. We have two options. We can enter an access key and secret, however, it is better practice to use a role and assign it to the server.

44) To create a new role;

 - In the AWS console, select the IAM service and click Roles from the left hand menu.
 - Click Create role.
 - Click EC2 under the Choose the service that will use this role and click Next: Permissions.
 - As this is a temporary role, we will just add AdministratorAccess. For roles that will be used for more than a quick test, we should only add the specific permissions that are needed. In our CloudFormation created roles, we are using more specific permissions. Tick the tickbox on the AdministratorAccess line.
 - Click Next: Tags and Next: Review.
 - Give the new role a Role name of TempServerRole and click Create role.

45) Select the EC2 service and click Running Instances to view the instances.

46) Tick the box next on the TempServer line, then click Actions and mouse over Instance Settings. Click Attach/Replace IAM Role.

47) From the drop down shown, select the TempServerRole and click Apply. This will allow the server to act as the attached role without needing to add any credentials to the running server. Click Close.

48) Back in the SSH terminal we can enter the following command to log into ECR. Replace **Region** with your region. The region can be found in the URL for the AWS console in your browser address bar.

```
$(aws ecr get-login --no-include-email --region **Region**)
```

49) In the AWS console, select the ECR service, and click Repositories from the left hand menu.

50) Copy the URI for the tsa/gallery repository. Then enter the following command into the SSH terminal.

```
docker pull **Copied URI**
```

This will download the latest build of the gallery docker image. As the config is setup to run already, we can start the API using the following command. Note that the copied URI is followed by a :latest.

```
docker run -d -p 3000:3000 **Copied URI**:latest
```

51) To test the docker image is working, we will make a request to the health check. Enter the following command.

```
curl http://localhost:3000/api/health
```

The server will responsd with {"healthOk":true,"buildNum":0}. We can also test the database is connecting properly by requesting the list of categories. Enter the following command.

```
curl http://localhost:3000/api/categories
```

If the database has gone to sleep, you may receive a timeout. This is due to the API code not being written to explicitly handle the way Aurora shuts down after inactivity. Run the same command a second time to get the result. You should get a line similar to:

```json
{"result":[{"id":1,"name":"Fiji","createStamp":"2019-05-06T05:43:47.000Z","updateStamp":"2019-05-06T05:43:47.000Z","createdBy":{"id":1,"name":"Admin"}}]}
```

#### Removing the temporary server

52) As we have confirmed the docker image works, we can remove the temporary server and the temporary role. In the AWS console, select the EC2 service and click Running Instances to view the instances.

53) Tick the box next on the TempServer line, then click Actions and mouse over Instance State. Click Terminate. When prompted, click Yes, Terminate.

54) Select the IAM service and click Roles from the left hand menu. Search for the TempServerRole.

55) Tick the box for the TempServerRole and click Delete role. When prompted, click Yes, delete.

### Wrap-up

In this lab we have taken our existing server based API and packaged it into a docker image. We used CodePipeline and CodeBuild to do the actual build and stored the image in ECR. We also tested the image works ready for the next lab.

#### Talking points

Using Docker micro-services. How granular should the micro-service containers be?

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
 - When prompted, click Delete to delete the snapshots.

### Assets

**[infra-lab6.yml](/assets/cloudformation/infra-lab6.yml)**
