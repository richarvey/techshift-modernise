+++
title= "Lab 4"
description= "Moving to a Serverless Database using Amazon Aurora"
draft = false
weight = -100
+++

### Objectives

The objective of this lab is move our database off the single instance to highly available and fault tollerant serverless database. This lab includes:

- Update CF Template to include Aurora Serverless
- Export data from our single instance
- Import the data into Aurora Serverless
- Update the code to use the new database

### Lab Guide

#### Add Aurora Serverless to CloudFormation

Open / switch to the CloudFormation infra.yaml template you have been working on in the previous labs in your favourite text editor.

For a database, we first need a Database Subnet 
Group. Add the following between the CFDistribution and the Outputs sections.

```
  DatabaseSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties:
      DBSubnetGroupDescription: CloudFormation managed DB subnet group
      SubnetIds: 
        - !Ref PrivateSubnetA
        - !Ref PrivateSubnetB
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::DatabaseSubnetGroup'] ]
```

Next we will add a new secret. The secret will be used to store the username and password for the new database. Using secrets allows us to store passwords in an easy to access location, while still keeping them secure. Using secrets manager we can also set up key rotation to add extra security.

```
  DatabaseSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Description: These are the master secrets for my Aurora Instance
      GenerateSecretString:
        ExcludeCharacters: '"@/\'
        GenerateStringKey: password
        PasswordLength: 40
        SecretStringTemplate: '{"username":"admin"}'
      Name: !Join ['', [!Ref 'AWS::StackName', '-RDSMasterSecret'] ]
  
  DatabaseSecretAttachment:
    Type: AWS::SecretsManager::SecretTargetAttachment
    Properties:
      SecretId:
        Ref: DatabaseSecret
      TargetId:
        Ref: DatabaseCluster
      TargetType: AWS::RDS::DBCluster
```

Next we add the database cluster.

```
  DatabaseCluster:
    Type: AWS::RDS::DBCluster
    DeletionPolicy: Delete
    Properties:
      DatabaseName: !Join ['', [!Ref 'AWS::StackName', 'Data'] ]
      DBClusterIdentifier: !Join ['', [!Ref 'AWS::StackName', '-database-cluster'] ]
      DBSubnetGroupName:
        Ref: DatabaseSubnetGroup
      Engine: aurora
      EngineMode: serverless
      ScalingConfiguration:
        AutoPause: true
        MaxCapacity: 16
        MinCapacity: 2
        SecondsUntilAutoPause: 7200
      Tags:
        - Key: 'Name'
          Value: !Join ['', [!Ref 'AWS::StackName', '::DatabaseCluster'] ]
      VpcSecurityGroupIds: 
        - !Ref PrivateSecurityGroup
      MasterUsername: !Join ['', ['{{resolve:secretsmanager:', Ref: 'AWS::StackName', '-RDSMasterSecret:SecretString:username}}'] ]
      MasterUserPassword: !Join ['', ['{{resolve:secretsmanager:', Ref: 'AWS::StackName', '-RDSMasterSecret:SecretString:password}}'] ]
    DependsOn:
      - DatabaseSubnetGroup
      - DatabaseSecret
```
      
In order for the webserver to read the secret value, we need to give the servers role a new policy documnet. In the ServerRole, directly above the RoleName, add a new line and copy the new policy in.

```
        -
          PolicyName: "ReadSecrets"
          PolicyDocument: 
            Version: "2012-10-17"
            Statement: 
              - 
                Effect: "Allow"
                Action: 
                  - "secretsmanager:GetSecretValue"
                Resource: "*"
```

Save the changes to your infra.yaml file and create a zip file containing the updated infra.yaml.

Back in AWS console, select the S3 service.

Select our data bucket. Click Upload and drop the Infra.yaml.zip file from step 6 onto the upload screen. Click Upload.

Select the CodePipeline service and select the TSABootstrap Pipeline to confirm it has run. It may take a few minutes to start and run. Both Source and Deploy should now show Succeeded.

#### Move the existing data

To move the data, we will need to get the database access details. Select the Secrets Manager service then select the secret named TSAGallery-RDSMasterSecret. If the secret is not named TSAGallery-RDSMasterSecret, make a note of the new name so we can use it later.

Scroll about half way down and click ** Retrieve secret value**. Copy the secret values and paste them into a text file as we will need them later.

SSH into your web server. You will need the certificate you created in lab 1.

Select the EC2 service, select Instances from the left hand menu and tick the box next to the TSAGallery::WebServer

Click Connect to get the connection instructions.

Enter the following command to export your current database to a file.

```
mysqldump -u tsauser -pmy-secret-pw tsagallery > dump.sql
```

Now we will push the data into the new Aurora database. You will need to replace the:

- HOSTNAME with value from Aurora cluster dashboard -> Connectivity & security tab.
- DATABASE_NAME with value from Aurora cluster dashboard -> Configuration tab.

When prompted, you need to copy and paste the password from step 11.

```
mysql -u admin -p -h HOSTNAME DATABASE_NAME < dump.sql
```

#### Update the application to use the Aruora database

Select the Cloud9 service and click Open IDE to re-open the editor.

We need to update the config. If the config.js file is not open, double click on the file to re-open it. Add a new line at the end of line 5.

Add the following value to the new blank line 6. If the secret name was different on step 8, replace the secret name value.

```
      secretName: process.env.SECRETNAME || 'TSAGallery-RDSMasterSecret',
```

Because we are using the Secrets Manager, we don't need any of the db config. Delete the following block from the config.js file. These should be lines 14 to 20.

```
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'tsauser',
        password: process.env.DB_PASSWORD || 'my-secret-pw',
        schema: process.env.DB_SCHEMA || 'tsagallery'
    },
```

Save the changes to config.js.

Open the app.js file by double clicking on the filename.

We need to remove the old database connection logic and add the secrets manager code. Delete the following block from lines 37 to 44.

```
      app.locals.dbpool = mysql.createPool({
        connectionLimit: 10,
        host: app.locals.config.db.host,
        port: app.locals.config.db.port,
        user: app.locals.config.db.username,
        password: app.locals.config.db.password,
        database: app.locals.config.db.schema
      });
```

And add the following code block back starting on line 50.

```
      var AWS = require('aws-sdk');
      var client = new AWS.SecretsManager({ region: app.locals.config.aws.region });

      var secretObj = await client.getSecretValue({SecretId: app.locals.config.aws.secretName}).promise();
      var secrets = JSON.parse(secretObj.SecretString);
      
      app.locals.dbpool = mysql.createPool({
        connectionLimit: 10,
        host: secrets.host,
        port: secrets.port,
        user: secrets.username,
        password: secrets.password,
        database: secrets.dbname
      });
```

This new code first uses the SDK to retrieve the credentials from Secrets Manager and then creates a database pool using the retrieved values.

Save the changes to app.js.

In the bash panel at the bottom of the screen, commit the changes to CodeCommit.

```
cd ~/environment/TSAGallery-API
git commit -a -m "Use Aurora RDS"
git push
```

#### Updating the server

Return to the SSH terminal window. If the connection has been closed, you will get a message stating, packet_write_wait... Broken pipe. In this case you will need to SSH back into your web server and return to the root user. You will need the certificate you created in lab 1.

Select the EC2 service, select Instances from the left hand menu and tick the box next to the TSAGallery::WebServer

Click Connect to get the connection instructions.

If the prompt starts with ec2-user@, enter the command as follows to resume as root. The prompt will change to root@.

```
sudo su -
```

Run the following commands to pull the latest code from 

```
CodeCommit. If prompted, enter the Git credentials for AWS CodeCommit we retrieved in Lab 3.
cd /opt/tsa_gallery/
forever stopall
git pull
```

Restart the web server and check if the process is running by issuing the following commands.

```
forever start ./bin/www.js
forever list
```

Lastly, as we are no longer using the local database, we can stop MySQL.

```
systemctl stop mariadb
systemctl disable mariadb
```

Confirm the application is still working by opening the CloudFront Distribution URL in your browser.

### Wrap-up

In this lab we have setup a servlerless database cluster, migrated our data into the new cluster and updated the server to use the new cluster.

### Talking points

- Using DMS (Database Migration Service) for more advanced data migrations.
- Using the Data API
- Why Aurora serverless shuts down and how to handle it more gracefully.

### Cleanup
To remove the resources you have created thus far:

Select the S3 service. You will need to empty the DataBucketName bucket, along with the pipeline artifacts buckets. These will named like tsa-bootstrap-pipelineartifacts-????? and *tsagallery-pipelineartifacts-?????**. You can empty a bucket using the Empty button after selecting the bucket in S3.

Select the Cloud9 service. Then select the Cloud9 instance and click the Delete button. When prompted, enter Delete in the input box and click Delete.

Select the CloudFormation service.

Select the TSAGallery stack by clicking the selection circle. The row will highlight blue.

Using the Actions menu, select Delete stack.

When prompted, click Delete.
This will delete all the resources that were created using the main CloudFormation template.

Use the same Delete stack method used on the TSAGallery stack to delete the TSA-Bootstrap stack.

While CloudFormation is deleting your stack, it will delete the RDS Database. However, it will first create a snapshot which will remain after the stack has been deleted. To delete any snapshots;

Select the RDS service.

Select Snapshots from the left hand menu.

Check the tickbox next to each snapshot you wish to delete, and click Actions then Delete Snapshot.

When prompted, click Delete to delete the snpashots.

### Assets

**[infra-lab4.yml](/assets/cloudformation/infra-lab4.yml)**
