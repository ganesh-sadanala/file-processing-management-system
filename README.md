- Application URL: https://prod.d2ez4eds2hhpye.amplifyapp.com/

### Repository Guide
**frontend**
- **Description:** `React.js` User Interface (UI) code.
- **Instructions to set up**
  - Install `node
  - .js` latest version.
  - download `fovus-coding-challenge/frontend/my-app` directory to local.
  - Run ```npm install``` on the root directory where the `package.json` file located to install dependencies
  - Run ```npm start``` to start application locally.

**cdk-code**
- **Description:** `TypeScript` AWS CDK code
- **Contents**
  - lib/cdk-app-stack.ts contains CDK code
  - lib/dblambda, lib/s3lambda, lib/vmlambda are the `Node.js` lambda used by CDK when deploying.
- **Set Up to deploy CDK to AWS**
  ```cdk
  // creates AWS environment in the specific region
  cdk boostrap aws://<aws_account_id>/<aws_region> --profile [credential_profile]
  
  // converts CDK to cloudformation file
  cdk synth
  
  # deploys the cloudformation stack to AWS environments
  cdk deploy 
  ```
- The AWS credentials should be storeed in `~/.aws/credentials` file.
**vmscript.sh**
- **Description:** contains script that runs as a userData script on VM launch on AWS Virtual Private Cloud(VPC).


### AWS Environment video
- AWS Environment - https://drive.google.com/file/d/1LYgUNL5Fz9qgJRCF2wbaHXdusHn5wWTT/view?usp=sharing
- AWS IAM - https://drive.google.com/file/d/1ubFH40P57nBSu1KNKYdDwDnhY441a3XM/view?usp=sharing

### References
[1]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
[2]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html
[3]: https://tailwindcss.com/docs/guides/create-react-app
[4]: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-creating-an-instance.html
[5]: https://www.bluematador.com/learn/aws-cli-cheatsheet
```
[1]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html
[2]: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.html

[3]: https://tailwindcss.com/docs/guides/create-react-app

[4]: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ec2-example-creating-an-instance.html

[5]: https://www.bluematador.com/learn/aws-cli-cheatsheet
```
Note: IacTemplate.yaml is attached from cloudformation to a picture of environment.
