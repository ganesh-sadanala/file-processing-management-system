import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from '@aws-cdk/aws-s3';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import { RemovalPolicy } from 'aws-cdk-lib';

export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = createS3Bucket(this);

    // Create DynamoDB table
    const table = createDynamoDBTable(this);

    // Create Lambda function
    const lambdaFunction = createLambdaFunction(this, bucket, table);

    // Create API Gateway
    const api = createAPIGateway(this, lambdaFunction);

    // Create EC2 instance
    const instance = createEC2Instance(this, bucket, table);

    // Add DynamoDB event source to Lambda function
    addDynamoDBEventSource(lambdaFunction, table);
  }
}


function createS3Bucket(scope: Construct): s3.Bucket {

  // L2 construct
  const bucket=new s3.Bucket(scope, 'FileBucket',  {
    bucketName: '',
    
  })

  return bucket;
}

