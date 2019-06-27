+++
title= "Lab 1"
description= "Setup your account for TechShift Accelerate"
draft = false
weight = -109
+++

## Objectives

The objective of this lab is to get your account setup ready for the TechShift Accelerate - Modernise labs.

### Lab Guide
Login to your AWS Console.

At the right top corner of the console, select a region that you will use for the remainder of these labs. All labs need to run in the same region. Select the closest region to you from the following regions to work in.

- EU (Ireland)
- Asia Pacific (Singapore)
- Asia Pacific (Tokyo)
- US East (N. Virginia)
- US East (Ohio)
- US West (Oregon)

Why only these regions? Not all services are available in all regions. During these labs, we will make use of the Cloud9 service to update our application code. Cloud9 is only available in the regions listed above. You can see what services are available in what regions by visiting: https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/

If you cannot select a region, you must first select a service that is not Global. For example, selecting the EC2 service will enable region selection.

#### Creating a SSH Certificate


Select the EC2 service.

Select Key Pairs from the right side menu.

Click Create Key Pair.

Give your new kay a name such as tsa-[region] and clieck Create.

Your borwser will download a file called tsa-[region].pem. You will need this file in later labs to connect to your server.


#### Setup the base infrastructure

Copy the infra.yaml from the Assets section below and save as infra.yaml on your local computer.

Select the CloudFormation service.

Select Create stack.

Select Upload a template file and click Choose file. When prompted select the CloudFormation template downloaded in step 7.

Click Next.

Enter TSAGallery for the Stack name and select the key you created in step 6 in KeyName. Click Next.

Leave all options blank and click Next at the bottom of the page.

Check the tickbox labeled I acknowledge that AWS CloudFormation might create IAM resources with custom names. and click Create stack.

Wait until the Stack status shows as Complete.


#### View our Photo Gallery

Select the Outputs tab. There will be a single output called URL. You can copy and paste the Value into your browser to view the running photo gallery. Note: Once the stack shows complete, the photo gallery may still be starting up. Just wait a minute or two and reload the page.

You can use the photo gallery to view the files. The access the site adminstration, click on the Current User: Guest in the top corner. Enter the username __admin__ and the password __2happymonkeys!__

#### Assets

**[infra-lab1.yml](/assets/cloudformation/infra-lab1.yml)**
