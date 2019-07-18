+++
title= "lab 8"
description= "Decoupling server tasks using SQS and Lambda"
draft = false
weight = -92
+++

### Objectives

The objective of this lab is to decouple the thumbnail creation from our server so it does not block the user using the site.

We will be using an SNS (Simple Notification Service) topic to handle adding a new image message to the thumbnail generators queue and we can easily add other actions when a new image is uploaded. We will be adding machine learning and AI by using the Amazon Rekognition service to process our images and identify objects in the images to use as tags within our application. This lab includes:

- Updating our CloudFormation Template to include an SNS topic, an SQS queue and the Lambda processor
- Updating our site code to remove the thumbnail creation logic and publish a message onto the SNS topic
- Adding an additional SQS queue and Lambda processor for the AI/ML processor
- Uploading a new image to confirm everything is working

#### Reference Architecture

![/img/arch/arch8.png](/img/arch/arch8.png)

### Lab Guide

#### Setup SNS and SQS Queues

We will be sending messages from the web server to the lambda workers using SNS (Simple Notification Service) and SQS (Simple Queue Service). After the webserver has saved a new image into S3, it will create a new image message and publish this to an SNS topic. SNS will then take the published message and send it to each of the subscribed receivers. In our case, we will be pushing the message into 2 SQS queues. However, SNS can push the message to many more subscribed receivers (up to limit of 12,500,000) if we wanted more processes to run on each new image. Using a separate SQS queue for each processor means that each process gets an independent copy of the message. If one of the processors started to fail, all other subscribed processors would continue to run independently.

Firstly we will create the new SNS topic and SQS queues.

1) Open / switch to the CloudFormation infra.yml template you have been working on in the previous labs in your favourite text editor.

2) Add the following SQS queues between the APIALBTG and the Outputs section.

```
  ThumbnailQueue:
    Type: AWS::SQS::Queue
      
  TagsQueue:
    Type: AWS::SQS::Queue
```

3) Add the SNS topic between the TagsQueue and the Outputs section.

```
  NewImageTopic:
    Type: AWS::SNS::Topic
    Properties: 
      DisplayName: !Join ['', [!Ref 'AWS::StackName', 'NewImageTopic'] ]
```

4) So messages get forwarded from the SNS topic through to the SQS Queues, we need a subscription. Add the two following two subscriptions between the NewImageTopic and the Outputs sections.

```
  ThumbnailSubscription:
    Type: AWS::SNS::Subscription
    Properties: 
      Endpoint: !GetAtt [ThumbnailQueue, Arn]
      Protocol: sqs
      RawMessageDelivery: true
      TopicArn: !Ref NewImageTopic

  TagsSubscription:
    Type: AWS::SNS::Subscription
    Properties: 
      Endpoint: !GetAtt [TagsQueue, Arn]
      Protocol: sqs
      RawMessageDelivery: true
      TopicArn: !Ref NewImageTopic
```

5) We also need to give the SNS topic permission to send items to the SQS queues. Add the following code block between the TagsSubscription and the Outputs sections.

```
  SendMessageQueuePolicy:
    Type: AWS::SQS::QueuePolicy
    Properties: 
      PolicyDocument: 
        Id: MyQueuePolicy
        Version: '2012-10-17'
        Statement:
        - 
          Sid: Allow-SendMessage-To-Both-Queues-From-SNS-Topic
          Effect: Allow
          Principal:
            AWS: "*"
          Action:
          - sqs:SendMessage
          Resource: "*"
          Condition:
            ArnEquals: 
              aws:SourceArn: !Ref NewImageTopic
      Queues: 
        - !Ref ThumbnailQueue
        - !Ref TagsQueue
```

#### Setup Lambda processors

For the two Lambda processors, we will be uploading the source using a zip file. In a production environment, we would use a CI/CD pipeline to build the source and update Lambda processors. For this exercise, the Lambda source is pre-compiled and ready to run.

6) Download the following two files and save them to your local computer.
   
 - [Tags Processor Source](/assets/downloads/tags.zip)
 - [Thumbnail Processor Source](/assets/downloads/thumbnails.zip)

The source can be viewed by extracting the zip file and opening the index.js file in a text editor. When Lambda executes the function it calls the function specified in the Lambda setup. In our case the handler is the exported function called handler.

7) In the AWS console, select the S3 service. Open the DataBucket by clicking on the DataBucket name (e.g. tsa-gallery.yourcompany.com or the name you used for your bucket created earlier). Click Create folder and when prompted, enter the name lambda-source and click Save. Open the lambda-source folder by clicking the folder name.

8) Click Upload then click Add files. Select the two zip files you downloaded and click Upload. These files should be named tags.zip and thumbnails.zip.

9) Back in our CloudFormation infra.yaml template. We need to add a new role for the Lambda process. When the Lambda function runs, it will run using this role. Add the following between the NewImageTopic and the Outputs section.

```
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          -
            Effect: "Allow"
            Principal:
              Service:
                - "lambda.amazonaws.com"
            Action:
              - "sts:AssumeRole"
      Path: "/"
      Policies:
        -
          PolicyName: "ReadAndWriteS3"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              -
                Effect: "Allow"
                Action:
                  - "s3:*"
                Resource: "*"
        -
          PolicyName: "AccessCloudWatchLogs"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              -
                Effect: "Allow"
                Action:
                  - "logs:CreateLogGroup"
                  - "logs:CreateLogStream"
                  - "logs:PutLogEvents"
                Resource: "*"
        -
          PolicyName: "AccessRekognition"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              -
                Effect: "Allow"
                Action:
                  - "rekognition:*"
                Resource: "*"
        -
          PolicyName: "AccessSQS"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              -
                Effect: "Allow"
                Action:
                  - "sqs:ReceiveMessage"
                  - "sqs:DeleteMessage"
                  - "sqs:GetQueueAttributes"
                Resource: "*"
      RoleName: !Join ['', [!Ref 'AWS::StackName', 'LambdaExecutionRole'] ]
```

```
We are giving the Lambda the following permissions:
* Access to SQS to receive and delete messages
* Read and write to S3 to update images
* Write to CloudWatch logs
* Access AWS Rekognition for object detection
```

10) Add the following two Lambda functions between the LambdaExecutionRole and the Outputs section. The Handler tells Lambda what function, from step 6, to run.

```
  ThumbnailLambda:
    Type: AWS::Lambda::Function
    Properties: 
      Code: 
        S3Bucket: !ImportValue TSAGallery-DataBucket
        S3Key: lambda-source/thumbnails.zip
      Description: !Join ['', [!Ref 'AWS::StackName', 'ThumbnailLambda'] ]
      Handler: "index.handler"
      MemorySize: 256
      Role: !GetAtt [LambdaExecutionRole, Arn]
      Runtime: "nodejs10.x"
      Timeout: 30

  TagsLambda:
    Type: AWS::Lambda::Function
    Properties: 
      Code: 
        S3Bucket: !ImportValue TSAGallery-DataBucket
        S3Key: lambda-source/tags.zip
      Description: !Join ['', [!Ref 'AWS::StackName', 'TagsLambda'] ]
      Handler: "index.handler"
      MemorySize: 256
      Role: !GetAtt [LambdaExecutionRole, Arn]
      Runtime: "nodejs10.x"
      Timeout: 30
```

11) Lastly, we need to create a mapping that links the SQS queue to the Lambda function. Add the following between the TagsLambda and the Outputs section.

```
  ThumbnailEventSourceMapping:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
      EventSourceArn: !GetAtt [ThumbnailQueue, Arn]
      FunctionName: !GetAtt [ThumbnailLambda, Arn]

  TagsEventSourceMapping:
    Type: AWS::Lambda::EventSourceMapping
    Properties:
      EventSourceArn: !GetAtt [TagsQueue, Arn]
      FunctionName: !GetAtt [TagsLambda, Arn]
```

12) Save the changes to your infra.yml file and create an updated zip file.

13) Back in AWS console, select the S3 service.

14) Select our data bucket. Click Upload and drop the infra.yml.zip file from step 12 onto the upload screen. Click Upload.

#### Updating the Server API

15) We need to find the name of our newly created SNS endpoint. There are two ways to find this out. Either via the SNS console, or CloudFormation. As the table belongs to our CloudFormation stack, and we may have multiple, we will use CloudFormation. Select the CloudFormation service and click TSAGallery stack from the stack list.

16) Click the Resources tab and find the resource with a Logical ID of NewImageTopic. Copy the Physical ID. This is the SNS ARN that we will need later.

17) Select the Cloud9 service and click Open IDE to re-open the editor.

18) Again we need to update the config. If the config.js file is not open, double click on the file to re-open it. Add a new line at the end of line 7.

19) Add the following value to the new blank line 8. You will need to replace the SNS-TOPIC-ARN with the SNS ARN you found on step 16.

```
      newImageSNS: process.env.NEWIMAGESNS || 'SNS-TOPIC-ARN',
```

20) The updated routing code for sending new images to the SNS topic along with an endpoint used by the Lambda functions can be found in the images.lab8.js file in the routes folder. Take some time to review the code. The POST function on line 87 has been updated so that new images are first saved into S3, then a message is published to the SNS topic. The SNS topic will then distribute the message to the two SQS queues that will invoke the Lambda functions.

The ThumbnailLambda function will use the uploaded image and generate the thumbnail. The TagsLambda takes the uploaded image and sends it to Amazon Rekognition for object detection. Detected objects are used to update the image tags.

We have also added a new endpoint on line 154 that allows the Lambda function to update an image tags while still keeping all the database access in the main project.

21) We need to update the project to use the new image router. Double click on the app.js file in the main folder. Update line 24 to read:

```
  var imagesRouter = require('./routes/images.lab8')(app);
```

Save the changes by clicking File and Save.

22) In the bash panel at the bottom of the screen, commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git commit -a -m "Use SQS for thumbnails"
git push
```

23) The API Pipeline will re-run as a result of the commit. If the Pipeline does not start, it can be kicked off using the Release change button to force the build to start. Once the build has finished, reload the site using the CloudFront distribution URL.

#### Testing

24) Visit your photo gallery CloudFront distribution URL.

25) Login using the credentials Username admin and Password 2happymonkeys!

26) Click the + at the bottom of the screen to upload a new image. When prompted, enter a name and use the Choose file button to select a new image. Click Upload to upload the new image.

27) The image will upload. The photo gallery will show the uploaded image, but without the tags or thumbnail. As the process is running in the background, click Refresh in your browser. After about 20 seconds, the thumbnail will appear. After a minute or so, the tags will be updated based on the output of Amazon Rekognition.

### Wrap-up

In this lab we have taken the application and decomposed it by moving the thumbnail generation into a Lambda. We used SNS and SQS to message the Lambda that there is a new image to be processed. As a bonus, we added some AI / Machine learning by using the Amazon Rekognition service to detect objects in the image and update the tags.

### Talking points

- How could we update the SPA to automatically load the new thumbnail and tags?

#### Clean-up

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

**[infra-lab8.yml](/assets/cloudformation/infra-lab8.yml)**
