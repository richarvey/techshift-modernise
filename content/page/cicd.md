+++
title= "CI/CD"
description= ""
draft = false
weight = -105
+++
### CI/CD

#### What is CI?

CI stands for "continious intergration", this is a practice where developers merge code back to the main branch (in version control) as often as possible. It's then the role of the CI platform to emphasis on testing automation to check that the application is not broken whenever new commits are integrated into the main branch.

#### What is CD?

Two things!

##### Continious delivery

In one case CD stands for Continuous delivery it's an extension of CI which if the automated testing of CI passes, the CD platform will ready the release of the software to be deployed to customers at the click of a button. This can be done either on a per commit basis or on a schedule (hourly/daily/weekly/etc...)

However, if you truly want to get the benefits of continuous delivery, you should deploy to production as early as possible to make sure that you release small batches that are easy to troubleshoot in case of a problem.

##### Continuous deployment

In the other case CD stands for Continious deployment. This is a practice that goes one step further than Continious delivery and removes the human needed to click the button.

It relies on the tests you build into the pipeline to see if it should go ahead with the release. Moder systems also allow you to monitor you application for elevated error rates, which if detected can be used to roll back software to a previous state.

#### AWS CodePipeline

In our workshop we are going to use AWS CodePipeline to automated in a continious deployment manner the infrastructure, and we'll continue to use this throughout the workshop.

#### What's AWS CodePipeline

AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates. CodePipeline automates the build, test, and deploy phases of your release process every time there is a code change, based on the release model you define. This enables you to rapidly and reliably deliver features and updates. You can easily integrate AWS CodePipeline with third-party services such as GitHub or with your own custom plugin. With AWS CodePipeline, you only pay for what you use. There are no upfront fees or long-term commitments. 

#### How it works

![/img/cicd.png](/img/cicd.png)

#### Benefits

##### Rapid delivery

AWS CodePipeline automates your software release process, allowing you to rapidly release new features to your users. With CodePipeline, you can quickly iterate on feedback and get new features to your users faster.

Automating your build, test, and release process allows you to quickly and easily test each code change and catch bugs while they are small and simple to fix. You can ensure the quality of your application or infrastructure code by running each change through your staging and release process.

##### Configurable workflow

AWS CodePipeline allows you to model the different stages of your software release process using the console interface, the AWS CLI, AWS CloudFormation, or the AWS SDKs. You can easily specify the tests to run and customize the steps to deploy your application and its dependencies.

##### Get started fast

With AWS CodePipeline, you can immediately begin to model your software release process. There are no servers to provision or set up. CodePipeline is a fully managed continuous delivery service that connects to your existing tools and systems.

##### Easy to integrate

AWS CodePipeline can easily be extended to adapt to your specific needs. You can use our pre-built plugins or your own custom plugins in any step of your release process. For example, you can pull your source code from GitHub, use your on-premises Jenkins build server, run load tests using a third-party service, or pass on deployment information to your custom operations dashboard.