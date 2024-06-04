import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';

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


interface DynamoDBTables {
  fileUploadTable: dynamodb.Table;
  myFileTable: dynamodb.Table;
}

function createS3Bucket(scope: Construct): s3.Bucket {

  // L2 construct
  const bucket=new s3.Bucket(scope, 'fileappbucket',  {
    bucketName: 'fileappbucket',
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  })

  return bucket;
}

function createDynamoDBTable(scope: Construct): DynamoDBTables {
  const fileUploadTable = new dynamodb.Table(scope, 'file-upload', {
    partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
    stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    tableName: 'file-upload'
  })
  const myFileTable = new dynamodb.Table(scope, 'MyFile', {
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    tableName: 'MyFile'
  });

  return { fileUploadTable, myFileTable };
}





