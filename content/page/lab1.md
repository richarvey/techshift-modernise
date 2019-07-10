+++
title= "Lab 1"
description= "Setup your account for TechShift Accelerate"
draft = false
weight = -109
+++

### Objectives

The objective of this lab is to get your account setup and ready for the TechShift Accelerate - Modernise labs.

#### Reference Architecture

![/img/arch/arch1.png](/img/arch/arch1.png)

### Lab Guide

#### Login to your AWS Console.

1) At the right top corner of the console, select a region that you will use for the remainder of these labs. All labs need to run in the same region. Select the closest region to you from the following regions to work in.
        
- EU (Ireland)
- Asia Pacific (Singapore)
- Asia Pacific (Tokyo)
- US East (N. Virginia)
- US East (Ohio)
- US West (Oregon)

Why only these regions? Not all services are available in all regions.

During these labs, we will make use of the Cloud9 service to update our application code. Cloud9 is only available in the regions listed above. You can see which services are available in each region by visiting: [https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)

If you cannot select a region, you may be viewing a service which is a 'global' service such as IAM or Route53. Selecting the EC2 service will enable region selection.

#### Creating a SSH Certificate

2) Select the EC2 service.

3) Select Key Pairs from the left side menu.

4) Click Create Key Pair.

5) Give your new key a name such as tsa-[region] and click Create.

6) Your browser will download a file called tsa-[region].pem. You will need this file in later labs to connect to your server.

#### Setup the base infrastructure

7) Download the infra.yaml from the 'Assets' section below and save as infra.yaml on your local computer.

8) Back in the AWS console, select the AWS CloudFormation service.

9) Select Create stack.

10) Under 'Specify Template', select 'Upload a template file' and click 'Choose file'. When prompted select the CloudFormation template downloaded from the Assets section.

11) Click 'Next'.

12) Enter 'TSAGallery' for the Stack name and under 'KeyName' select the key you created earlier from the drop-down box. Click 'Next'.

13) You do not need to modify any options on the next page, click 'Next' at the bottom of the page.

14) At the bottom of the page, check the tickbox labelled 'I acknowledge that AWS CloudFormation might create IAM resources with custom names' and click 'Create stack'.

15) Wait until the stack 'Status' shows as 'Complete'.

#### View our Photo Gallery

16) Select the 'Outputs' tab. There will be a single output called 'URL'. You can click on the 'Value' or copy and paste the URL into your browser window to view the running photo gallery.

__Note__: Once the stack shows as complete, the photo gallery may still be starting up. Just wait a minute or two and reload the page.

17) You can use the photo gallery application to view photos. To access the site administration page, click on 'Current User: Guest' in the top right corner. Enter the username 'admin' and the password '2happymonkeys!' (without the apostrophe!)

#### Assets

**[infra-lab1.yml](/assets/cloudformation/infra-lab1.yml)**
