import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as pipelineactions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as path from "path";

export interface pipelineProps {
    rep: string;
    fetchProjectName: string;
    buildProjectName: string;
    bucketObjectUri: string;
}

export class MyCdkConstruct extends Construct {
  constructor(scope: Construct, id: string, props: pipelineProps) {
    super(scope, id);

    // Create a CodeCommit repository
    const repo = new codecommit.Repository(this, 'MyRepo', {
      repositoryName: props.rep,
      code: codecommit.Code.fromDirectory(path.join(__dirname, '../app/'), 'main'),
      
    });


    const FetchProject = new codebuild.Project(this, `fetchProject`, {
      projectName: props.fetchProjectName,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        BUCKETURI: { value: props.bucketObjectUri},
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [
              "ls",
              "echo 'Bucket path-'$BUCKETURI",
              "aws s3 cp s3://$BUCKETURI ."
            ],
          }
        },
        artifacts: {
          files: ["./**/*"]
        },
        
      }),
    });

    const BuildProject = new codebuild.Project(this, `buildProject`, {
      projectName: props.buildProjectName,
      source: codebuild.Source.codeCommit({ repository: repo }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
        computeType: codebuild.ComputeType.SMALL
      },
      environmentVariables: {
        BUCKETURI: { value: props.bucketObjectUri},
      },
      buildSpec: codebuild.BuildSpec.fromSourceFilename('buildspec.yml')
    });

    

      const sourceArtifact = new codepipeline.Artifact();
      const outputArtifact = new codepipeline.Artifact();

    // Create a CodePipeline
    const pipeline = new codepipeline.Pipeline(this, 'MyPipeline', {
      pipelineName: 'my-cdk-app-pipeline',
      stages: [
        {
            stageName: 'Source',
            actions: [
                new pipelineactions.CodeCommitSourceAction({
                  actionName: "AppCodeCommit",
                  branch: "main",
                  output: sourceArtifact,
                  repository: repo,
                  trigger: cdk.aws_codepipeline_actions.CodeCommitTrigger.NONE
                })
            ]
        },
        {
            stageName: 'fetch',
            actions: [
                new pipelineactions.CodeBuildAction({
                    actionName: 'FetchArtifact',
                    project: FetchProject,
                    input : sourceArtifact,
                    outputs: [outputArtifact]
        
                })
            ]
        },
        {
          stageName: 'Build',
          actions: [
              new pipelineactions.CodeBuildAction({
                  actionName: 'CodeBuild_Action',
                  project: BuildProject,
                  input : outputArtifact
      
              })
          ]
      }
      ]
    });

  }
}