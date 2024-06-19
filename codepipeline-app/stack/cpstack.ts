import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { MyCdkConstruct } from '../lib/codepipeline-stack';


export class ServStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      new MyCdkConstruct(this, 'AWSResouronstructt', {
        
        rep: "My-docs-repo", 
        fetchProjectName: "myfetch-project",
        bucketObjectUri: "myartifact-bucket/sample.zip",
        buildProjectName: "mybuild-project"
        
    });


    }
  }
