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

**backend**
- **Description:** This folder contains 3 lambda codes
  - **s3lambda:** This `Node.js` lambda code runs in Amazon Web Services(AWS) and contains the code to generate pre signed url of s3 bucket.
    This is done to avoid any AWS access keys or credentials in the code(not in config, not in env, not hardcode, no placeholder, follow best practices).
  - **dblambda:** This `Node.js` lambda code runs in AWS and contains the code to update dynamodb with the file details.
  - **vmlambda:** This `Node.js` lambda code runs in AWS and contains the code to create virtual machine(VM) and run the `vmscript.sh` file 
    to meet the requirements.

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
