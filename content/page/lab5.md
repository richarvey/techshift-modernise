+++
title= "Lab 5"
description= "Removing server stickiness using Amazon DynamoDB"
draft = false
weight = -98
+++

### Objectives

The objective of this lab is to move the session cache from an in-proc provider to a DynamoDB. This lab includes:

- Update CF Template to include the DynamoDB table
- Update the application code to use the new cache

### Lab Guide

#### Add a DynamoDB table to CloudFormation

1) Open / switch to the CloudFormation infra.yaml template you have been working on in the previous labs in your favourite text editor.

2) We need to define our DynamoDb properties. In this case we are using PAY_PER_REQUEST which allows for unpredictable workloads. We are also setting the TimeToLiveSpecification which tells DynamoDb to automatically delete any records have expired. It does this by comparing the time stored in the attributed defined by the AtttributeName with the current time in epoch time format. If the stored time is smaller (earlier) than the current time, the item is marked as expired and subsequently deleted. Add the following between the CFDistribution and the Outputs sections.

```
  DynamoDBCache:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Join ['', [!Ref 'AWS::StackName', 'Cache'] ]
      AttributeDefinitions:
      - AttributeName: key
        AttributeType: S
      KeySchema:
      - AttributeName: key
        KeyType: HASH
      BillingMode: PAY_PER_REQUEST
      TimeToLiveSpecification:
        AttributeName: ttl
        Enabled: true
```

3) In order for the webserver to access the new DynamoDB value, we need to give the servers role a new policy documnet. In the ServerRole, directly above the RoleName, add a new line and copy the new policy in.

```
        -
          PolicyName: "AccessDynamoDB"
          PolicyDocument: 
            Version: "2012-10-17"
            Statement: 
              - 
                Effect: "Allow"
                Action: 
                  - "dynamodb:*"
                Resource: "*"
```

4) Save the changes to your infra.yaml file and create a zip file containing the updated infra.yaml.

5) Back in AWS console, select the S3 service.

6) Select our data bucket. Click Upload and drop the Infra.yaml.zip file from step 4 onto the upload screen. Click Upload.

7) Select the CodePipeline service and select the TSAGallery-Infra Pipeline to confirm it has run. It may take a few minutes to start and run. Both Source and Deploy should now show Succeeded.

#### Update the application to use DynamoDb

8) We need to find the name of our newly created DynamoDB table. There are two ways to find the table name. Either via the DynamoDB console, or CloudFormation. As the table belongs to our CloudFormation stack, and we may have multiple, we will use CloudFormation. Select the CloudFormation service and click TSAGallery stack from the stack list.

9) Click the Resources tab and find the resource with a Logical ID of DynamoDBCache. Copy the Physical ID. This is the table name we will need later.

10) Select the Cloud9 service and click Open IDE to re-open the editor.

11) Again we need to update the config. If the config.js file is not open, double click on the file to re-open it. Add a new line at the end of line 6.

12) Add the following value to the new blank line 6. If the table name was different on step 9, replace the table name value.

```
      dynamoTable: process.env.CACHETABLE || 'TSAGalleryCache',
```

13) The updated code for using DynamoDB as a cache provider can be found in the cache.lab5.js file. Take some time to review the code.

14) We need to update the project to use the new filesystem. Expand the bin folder under the TSAGallery-API folder. Double click on the www.js file. Update line 24 to read:

```
app.locals.cache = new (require("../utils/cache.lab5"))(app);
```

Save the changes by clicking File and Save.

15) In the bash panel at the bottom of the screen, commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git commit -a -m "Use DynamoDB"
git push
```

#### Updating the server

16) Return to the SSH terminal window. If the connection has been closed, you will get a message stating, packet_write_wait... Broken pipe. In this case you will need to SSH back into your web server and return to the root user. You will need the certificate you created in lab 1.

- Select the EC2 service, select Instances from the right hand menu and tick the box next to the TSAGallery::WebServer
- Click Connect to get the connection instructions.

17) If the prompt starts with ec2-user@, enter the command as follows to resume as root. The prompt will change to root@.

```
sudo su -
```

18) Run the following commands to pull the latest code from CodeCommit. If prompted, enter the Git credentials for AWS CodeCommit we retrieved in Lab 3.

```
cd /opt/tsa_gallery/
forever stopall
git pull
```

19) Restart the web server and check if the process is running by issuing the following commands.

```
forever start ./bin/www.js
forever list
```

20) Confirm the application is still working by opening the CloudFront Distribution URL in your browser.

21) We can confirm our changes are using the new DynamoDB table by selecting the DynamoDB service, then click Tables from the left hand menu. Click on the TSAGalleryCache table name to open the table, then click the Items* tab to view the tables current items. We should see a number of items that are the cache. If we have logged in as Admin, we will also sea one or more session:... records.

### Wrap-up

In this lab we have setup a DynamoDB table and updated the API to use the new DynamoDB table for session and cache data.
Talking points

- Dynamo DB vs ElastiCache

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

8) While CloudFormation is deleting your stack, it will delete the RDS Database. However, it will first create a snapshot which will remain after the stack has been deleted. To delete any snapshots;

- Select the RDS service.
- Select Snapshots from the left hand menu.
- Check the tickbox next to each snapshot you wish to delete, and click Actions then Delete Snapshot.
- When prompted, click Delete to delete the snpashots.

### Assets

**[infra-lab5.yml](/assets/cloudformation/infra-lab5.yml)**

