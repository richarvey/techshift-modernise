+++
title= "Lab 3"
description= "Moving the SPA out of the application and serving using S3/CloudFront"
draft = false
weight = -102 
+++

### Objectives

The objective of this lab is move the static portions of the solution from the application to an S3 bucket served using CloudFront. This lab includes:

- Setup a CodeCommit repository for the SPA and copy the SPA code.
- Updating our CloudFormation template to include a CodePipeline, S3 bucket and CloudFront distribution.
- Run the CodePipeline to deply the SPA into the S3 bucket.
- Copy our image assets to our asset S3 bucket.
- Update our application to store phsical assets such as thumbnails and images in the S3 bucket.

#### Reference Architecture

![/img/arch/arch3.png](/img/arch/arch3.png)

### Lab Guide

1) Login to your AWS Console.

#### Setup CodeCommit

__Note:__ While we have been using CloudFormation to setup the resouces we are using, for the code repositories we will be manually setting them up. In a development environment, you don't want your code repositories to be tied to the infrastructure. By creating these independently to the infrastructure, we can replicate the infrastructure using CloudFormation, while referencing the seperate code repositories.

2) Select the CodeCommit service and click Create repository.

3) Enter TSAGallery-SPA as the Repository name and click Create. SPA stands for Single Page Applicaition. Generally an SPA is simply a web site where the site is delivered via a single HTML page that "talks" to an API for it's data. This includes sites built using Angular and React.

4) Click Repositories from the left hand menu, then click Create repository again.

5) Enter TSAGallery-API as the Repository name and click Create. API stands for Application Programming Interface and is the server side of our application. The SPA will "talk" to this API to get photos and data.

6) Select the IAM service and click Users.

7) Click on the user you use to log into the console to open the user summary.

8) Click on the Security credentials tab and scroll to the bottom.

9) Under HTTPS Git credentials for AWS CodeCommit click Generate to create a user for CodeCommit access.

10) Make a note of the username and password generated, by coping them to a new text document, as you will need these later.

#### Updating the SPA code repository

11) SSH into your web server. You will need the certificate you created in lab 1.

- Select the EC2 service, select Instances from the right hand menu and tick the box next to the TSAGallery::WebServer
- Click Connect to get the connection instructions.

12) Once you have connected to your web server via SSH, we need to clone the empty CodeCommit repository. In the browser, select the CodeCommit service and click on the TSAGallery-SPA repository.

13) Click on the Clone URL button and then Clone HTTPS to copy the clone URL to your clipboard. Make a note in a text file of this Url as the SPA Git Url.

14) Back in the SSH terminal window, enter the following commands. After the git clone command paste the the copied SPA Git Url. When prompted, enter the username and password from step 10.

```
git config --global credential.helper store
git clone **SPA Git Url**
```

15) Copy the public SPA into the newly cloned repository.

```
sudo cp -r /opt/tsa_gallery/public/* ./TSAGallery-SPA/
```

16) Update the file ownership to allow us to keep working.

```
sudo chown -R ec2-user:ec2-user ./TSAGallery-SPA/*
chmod -R 700 TSAGallery-SPA
```

17) Next, we need to get rid of the uploaded images as they are not part of the SPA.

```
mkdir ./Uploads
mv ./TSAGallery-SPA/images/uploads/* ./Uploads/
```

18) Now commit the changes.

```
cd TSAGallery-SPA
git add *
git commit -m "Initial Commit"
git push
```

If prompted, enter the username and password from step 10.

19) You can now confirm that the code has been committed by selecting the CodeCommit service and clicking on the TSAGallery-SPA repository. The repoistory should contain two folers and two files.

#### Copy image assets to S3

Next we need to copy the image assets to the S3 data bucket and update the code to use the CloudFront locations.

20) Back in our SSH terminal window, run the following commands to copy to the S3 data bucket. Replace the BucketName in the second line with the data bucket name.

```
cd ..
aws s3 cp ./Uploads s3://**BucketName**/images/uploads --recursive
```

21) You can now confirm that the images have been uploaded to S3 by selecting the S3 service and clicking on the data bucket name to open the bucket. Then click on the images folder then the uploads folder. The folder should contain six files.

22) ow we need to update the application code to use S3 based images.

#### Upload the API to the CodeCommit Repository

23) Firstly, we need to delete the the public information as we will be serving it from S3. As the application is "owned" by the root user, we need to run the following commands as the root user. Run the following commands to get to the site as root.

```
sudo su -
cd /opt/tsa_gallery/
```

24) Delete the public information.

```
rm -rf public
```

25) Create a new Git repository in the current folder and add the files to the next commit. You will get an error about node_modules being ignored. This is normal.

```
git init .
git add *
git add .gitignore
git commit -m "Initial Commit"
```

26) We need to connect our local Git repository with our CodeCommit repository. In the borwser, select the CodeCommit service and click on the TSAGallery-API repository. Click on the Clone URL button and then Clone HTTPS to copy the clone URL to your clipboard. Make a note in a text file of this Url as the API Git Url.

27) Back in the SSH terminal window, run the following command. You will need to paste the copied Clone URL at the end.

```
git remote add origin **API Git Url**
```

28) Push the code to our CodeCommit repository.

```
git config --global credential.helper store
git push --set-upstream origin master
```

If prompted, enter the username and password from step 10.

#### Setting up Cloud9

__Note:__ If you are comfortable editing source code on your local computer, these steps are not required, you can skip through to Updating the server code. For the remainder of the labs, we will use Cloud9 as the editor, however all steps will work using a local development environment.

29) First we will get a public subnet id. The Cloud9 instance must run in a public network in order for you to be able to use it from your local computer. Select the VPC service and click Subnets to view all your subnets.

30) Find one of the two public subnets. They will be named TSAGallery::PublicSubnetA and TSAGallery::PublicSubnetB. Make a note of the Subnet ID and the VPC ID.

31) Select the Cloud9 service, and click Create environment.

32) Enter TSAGallery-Editor as the Name. Click Next step.

33) Select t2.small as the Instance type. At the bottom, expand the Network settings (advanced).

34) Select the VPC ID from step 29, and then the Subnet ID also from step 29.

35) Click Next step and then Create environment. Creating your Cloud9 environment may take a few minutes. Once it has loaded, you can use the terminal at the bottom of the screen to enter the git commands in the next section.

#### Updating the server code

36) We need to clone the API code in order to update it. Enter the following commands in the bottom panel in Cloud9. This is the bash shell for your development environment and will be showing a prompt of Admin:~/environment $

```
git config --global credential.helper store
git clone **API Git Url**
```

If prompted, enter the username and password from step 10.

37) Update our working project with dependencies.

```
cd TSAGallery-API/
npm update
```

38) As we will be using the AWS SDK for Javascript to handle the communication between our project and the AWS services, we need to add this to the project.

```
npm install aws-sdk --save
```

39) We need to update our application to support S3 based files. Using the tree view on the right, expand the TSAGallery-API folder, then the utils folder.

40) Double click on the config.js file to open it in an editor. You will need to add the following code block into the config. Firstly add a new line on 3, then paste the code block into the new blank line. Then update the two values to match your region and DataBucketName. Save the changes by clicking File and Save.

To find the correct region id for your configuration, ensure the correct region is selected and look in the URL for the AWS console when you are viewing the AWS console home page.

EG. For Singapore the home page is at https://ap-southeast-1.console.aws.amazon.com/console/home?region=ap-southeast-1# and the region is ap-southeast-1.

```
    aws: {
      region: process.env.REGION || '**YOUR REGION ID GOES HERE**',
      s3Bucket: process.env.S3_BUCKET || '**DataBucketName GOES HERE**',
    },
```

41) The updated code for saving files into S3 can be found in the filesystem.lab3.js file. Take a look at the deletePublic and moveFileToPublic functions and compare them to the same files in filesystem.js.

42) We need to update the project to use the new filesystem. Expand the bin folder under the TSAGallery-API folder. Double click on the www.js file. Update line 29 to read:

```
app.locals.fs = new (require("../utils/filesystem.lab3"))(app);
```

Save the changes by clicking File and Save.

43) In the bash panel at the bottom of the screen, commit the changes to CodeCommit.

```
git commit -a -m "Use S3 for files"
git push
```

#### Updating the server

44) Return to the SSH terminal window. If the connection has been closed, you will get a message stating, packet_write_wait... Broken pipe. In this case you will need to SSH back into your web server and return to the root user. You will need the certificate you created in lab 1.

- Select the EC2 service, select Instances from the right hand menu and tick the box next to the TSAGallery::WebServer
- Click Connect to get the connection instructions.

45) If the prompt starts with ec2-user@, enter the command as follows to resume as root. The prompt will change to root@.

```
sudo su -
```

46) Change to the web server directory.

```
cd /opt/tsa_gallery/
```

47) Stop the current version of the server.

```
forever stopall
```

48) Update the code from the CodeCommit repository.

```
git pull
```

If prompted, enter the username and password from step 10.

49) Update the NodeJS dependencies and restart the web server.

```
npm update
forever start ./bin/www.js
```

You can check if the process is running by issuing the following command:

```
forever list
```

#### Use CodePipeline to deploy our SPA to S3

Now that we have our SPA in CodeCommit, we need to push it somewhere that we can serve it from. We will be using CloudFront to serve the whole application so S3 is the best place to put the SPA source. We will use CodePipeline to do this deployment.

50) Open / switch to the CloudFormation infra.yaml template you have been working on in the previous labs in your favourite text editor.

51) Again we need an S3 bucket for CodePipeline to store it's artifacts. We have the option of storing these artifacts in the same bucket as the Bootstrap pipeline, but we want keep the infrastructure and bootstrap artifacts seperate. Add a new S3 bucket between PipelineRole and the Output section.

```
  PipelineArtifacts:
    Type: AWS::S3::Bucket
```

52) Add the CodePipeline below the PipelineArtifacts and above the Output section. Take a moment to review the structure of the pipeline. This pipeline consists of two stages. The first stage named SourceAction pulls the master branch from the CodeCommit repository. While the second DeployAction, pushes the files into S3.

```
  SPAPipeline:
    Type: AWS::CodePipeline::Pipeline
    Properties:
      Name: !Join ['', [!Ref 'AWS::StackName', '-SPA-Pipeline'] ]
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
                RepositoryName: TSAGallery-SPA
              OutputArtifacts:
                - Name: SourceArtifact
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
                Provider: S3
              Configuration:
                ObjectKey: !Join ['', [!Ref 'AWS::StackName', '-spa-source'] ]
                Extract: true
                BucketName: !ImportValue TSAGallery-DataBucket
```

#### Serving using CloudFront

53) Lastly, we need to setup a CloudFront distribution to serve the static assets and route the API requests to the existing server. We need an access identity to allow CloudFront to read our S3 files. Add a new access identity between the PipeLine and the Output section.

```
  CFOriginAccessIdentity:
    Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
    Properties:
      CloudFrontOriginAccessIdentityConfig:
        Comment:  !Join ['', [!Ref 'AWS::StackName', 'CFOriginAccessIdentity'] ]
```

54) Next we will apply a bucket policy to the data bucket to grant read access to the previously added Access Identity between the CFOriginAccessIdentity and the Output section..

```
  DataBucketAccessPolicy:
    Type: AWS::S3::BucketPolicy
    Properties: 
      Bucket: !ImportValue TSAGallery-DataBucket
      PolicyDocument: 
        Statement:
          -
            Action:
              - "s3:GetObject"
            Effect: "Allow"
            Resource: !Join [ "", [ "arn:aws:s3:::", !ImportValue TSAGallery-DataBucket, "/*" ] ]
            Principal: 
              CanonicalUser: !GetAtt CFOriginAccessIdentity.S3CanonicalUserId
```

55) Add the CloudFront distribution between thye DataBucketAccessPolicy and the Output section. The CloudFront distribution consists of cache behaviours and origins. The cache behaviors map to the incomming request by the PathPattern. If there is no explicit mapping, the DefaultCacheBehavior is selected. Once a behavior is found, CloudFront routes the request to an origin based on the TargetOriginId. In our case, the origins map to either our S3 bucket or the API server.

```
  CFDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig: 
        CacheBehaviors:
          -
            Compress: true
            ForwardedValues:
              QueryString: false
            PathPattern: images/uploads/*.*
            TargetOriginId: S3-TSAGallery/Uploads
            ViewerProtocolPolicy: allow-all
          -
            Compress: false
            MaxTTL: 0
            MinTTL: 0
            DefaultTTL: 0
            ForwardedValues:
              QueryString: true
            PathPattern: api/*
            TargetOriginId: EC2-Endpoint
            ViewerProtocolPolicy: allow-all
            AllowedMethods:
            - DELETE
            - GET
            - HEAD
            - OPTIONS
            - PATCH
            - POST
            - PUT
        DefaultCacheBehavior:
          Compress: true
          ForwardedValues:
            QueryString: false
          TargetOriginId: S3-TSAGallery/SPA
          ViewerProtocolPolicy: allow-all
        DefaultRootObject: index.html
        Enabled: true
        Origins:
          -
            CustomOriginConfig:
              OriginProtocolPolicy: http-only
            DomainName: 
              Fn::GetAtt:
                - WebServer
                - PublicDnsName
            Id: EC2-Endpoint
          -
            S3OriginConfig:
              OriginAccessIdentity: !Join ['', ['origin-access-identity/cloudfront/', !Ref 'CFOriginAccessIdentity'] ]
            DomainName: !Join [ "", [ !ImportValue TSAGallery-DataBucket, ".s3.", !Ref 'AWS::Region', ".amazonaws.com" ] ]
            Id: S3-TSAGallery/Uploads
          -
            S3OriginConfig:
              OriginAccessIdentity: !Join ['', ['origin-access-identity/cloudfront/', !Ref 'CFOriginAccessIdentity'] ]
            DomainName: !Join [ "", [ !ImportValue TSAGallery-DataBucket, ".s3.", !Ref 'AWS::Region', ".amazonaws.com" ] ]
            OriginPath: !Join ['', ['/', !Ref 'AWS::StackName', '-spa-source'] ]
            Id: S3-TSAGallery/SPA
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::CFDistribution'] ]
```

56) Lastly, we add another output to access the new CloudFront distribution's public URL. Add to the end of the infra.yaml:

```
  DistributionUrl:
    Value:
      Fn::Join:
      - ''
      - - http://
        - Fn::GetAtt:
          - CFDistribution
          - DomainName
    Description: CloudFront Distribution URL
```

57) Save the changes to your infra.yaml file and create a zip file containing the updated infra.yaml.

58) Back in AWS console, select the S3 service.

59) Select our data bucket. Click Upload and drop the Infra.yaml.zip file from step 57 onto the upload screen. Click Upload.

60) Select the CodePipeline service and select the TSAGallery-Infra Pipeline to confirm it has run. It may take a few minutes to start. The CloudFront distribution may take up to 10-15 minutes to start. This is due to the time it takes to propagate the new distribution to all the CloudFront Points of Presence. Once the update is finished, both Source and Deploy will show Succeeded.

61) Using the Outputs tab, retrieve the DistributionUrl. Open this URL in your web browser to view the site as delivered via CloudFront. You can also try loading the site from the original site URL. The site will fail as the SPA is now served from S3.

### Wrap-up

In this lab you achieved a lot. You have taken a big step towards modernising your application and set a solid basis for the next labs. In review, in this lab you have:

- Setup a CodeCommit repository for the SPA and the API code.
- Copied the SPA and API code into the new repositories.
- Moved our uploaded image assets to S3.
- Updating our CloudFormation template to include a CodePipeline, S3 bucket and CloudFront distribution.
- Run the CodePipeline to deply the SPA into the S3 bucket.
- Copy our image assets to our asset S3 bucket.
- Update our application to store phsical assets such as thumbnails and images in the S3 bucket.

### Talking points

- Using WAF to provide additional security on the CloudFront distribution.
- Using time-to-live values in CloudFront and why the API has 0 for the time-to-live.

### Cleanup

To remove the resources you have created thus far:

1) Select the S3 service. You will need to empty the DataBucketName bucket, along with the pipeline artifacts buckets. These will named like tsa-bootstrap-pipelineartifacts-????? and *tsagallery-pipelineartifacts-?????**. You can empty a bucket using the Empty button after selecting the bucket in S3.

2) Select the Cloud9 service. Then select the Cloud9 instance and click the Delete button. When prompted, enter Delete in the input box and click Delete.

3) Select the CloudFormation service.

4) Select the TSAGallery stack by clicking the selection circle. The row will highlight blue.

5) Using the Actions menu, select Delete stack.

6) When prompted, click Delete.

This will delete all the resources that were created using the main CloudFormation template.

7) Use the same Delete stack method used on the TSAGallery stack to delete the TSA-Bootstrap stack.

### Assets

**[infra-lab3.yml](/assets/cloudformation/infra-lab3.yml)**
