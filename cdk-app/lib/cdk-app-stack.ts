import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import { Lambda } from 'aws-cdk-lib/aws-ses-actions';

export class CdkAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucket = createS3Bucket(this);

    // Create DynamoDB table
    const table = createDynamoDBTable(this);

    // Create Lambda functions
    const fileUploadLambda = createFileUploadLambda(this, bucket, table.fileUploadTable);
    const generatePreSignedUrlLambda = createGeneratePreSignedUrlLambda(this, bucket);
    const appCreateVmLambda = createAppCreateVmLambda(this, bucket, table;

    // Create API Gateway
    const api = createAPIGateway(this, fileUploadLambda, generatePreSignedUrlLambda);

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

function createFileUploadLambda(scope: Construct, bucket: s3.Bucket, table: dynamodb.Table): lambda.Function {
  const lambdaRole=new iam.Role(scope, 'FileUploadLambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    ],
  })

  const lambdaFunction=new lambda.Function(scope, 'fileUpload', {
    functionName: 'fileUpload',
    runtime: lambda.Runtime.NODEJS_LATEST,
    code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/fileUpload')),
    handler: 'index.handler',
    role: lambdaRole
  })

  bucket.grantReadWrite(lambdaFunction);
  table.grantReadWriteData(lambdaFunction);
  
  return lambdaFunction
}

function createGeneratePreSignedUrlLambda(scope: Construct, bucket: s3.Bucket):lambda.Function {

  const lambdaRole = new iam.Role(scope, 'GeneratePreSignedUrlLambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    ],
  });

  const lambdaFunction = new lambda.Function(scope, 'generatePreSignedUrl', {
    functionName: 'generatePreSignedUrl',
    runtime: lambda.Runtime.NODEJS_LATEST,
    code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/generatePreSignedUrl')),
    handler: 'index.handler',
    role: lambdaRole,
  });

  bucket.grantRead(lambdaFunction);
  return lambdaFunction
}

function createAppCreateVmLambda(scope: Construct, bucket: s3.Bucket, table: DynamoDBTables): lambda.Function {
  const lambdaRole = new iam.Role(scope, 'GeneratePreSignedUrlLambdaRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
    ],
  });

  const lambdaFunction = new lambda.Function(scope, 'appCreateVm', {
    functionName: 'app-create-vm',
    runtime: lambda.Runtime.NODEJS_LATEST,
    code: lambda.Code.fromAsset(path.join(__dirname, 'lambda/appCreateVm')),
    handler: 'index.handler',
    role: lambdaRole
  });

  bucket.grantRead(lambdaFunction);
  table.myFileTable.grantReadWriteData(lambdaFunction);
  table.fileUploadTable.grantStreamRead(lambdaFunction);

  // Add DynamoDB event source mapping
  lambdaFunction.addEventSource(new lambdaEventSources.DynamoEventSource(table.fileUploadTable, {
    startingPosition: lambda.StartingPosition.LATEST,
    batchSize: 1,
    retryAttempts: 3,
  }));

  return lambdaFunction;
}

function createAPIGateway(scope: Construct, fileUploadLambda:lambda.Function, generatePreSignedUrlLambda:lambda.Function): apigateway.RestApi{
  const api=new apigateway.RestApi(scope, 'FileAPI',  {
    restApiName: 'FileUploadAPI',
    description: 'API for file upload and pre-signed URL generation',
    deployOptions: {
      stageName: 'default',
      tracingEnabled: true,
    },
    defaultCorsPreflightOptions: { // add cors
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
    },
  });

  const fileResource = api.root.addResource('file');
  const uploadIntegration = new apigateway.LambdaIntegration(fileUploadLambda);
  const generatePreSignedUrlIntegration = new apigateway.LambdaIntegration(generatePreSignedUrlLambda);


  // POST /file
  const uploadMethod = fileResource.addMethod('POST', uploadIntegration, {
    methodResponses: [
      {
        statusCode: '200',
        responseModels: {
          'application/json': apigateway.Model.EMPTY_MODEL,
        },
      },
    ],
  });

  // POST /file/generate-pre-signed-url
  const generatePreSignedUrlResource = fileResource.addResource('generate-pre-signed-url');
  const generatePreSignedUrlMethod = generatePreSignedUrlResource.addMethod('POST', generatePreSignedUrlIntegration, {
    methodResponses: [
      {
        statusCode: '200',
        responseModels: {
          'application/json': apigateway.Model.EMPTY_MODEL,
        },
      },
    ],
  });

  return api;

}





