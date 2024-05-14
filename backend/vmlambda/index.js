exports.handler = async (event) => {
    const AWS = require('aws-sdk');

    try {
      const ec2 = new AWS.EC2({ region: 'us-east-2' });
        const data = `#!/bin/bash
                             aws s3 cp s3://fileappbucket/vmscript.sh .
                             chmod +x vmscript.sh
                             ./vmscript.sh ${event.Records[0].dynamodb.NewImage.id.S} ${event.Records[0].dynamodb.NewImage.input_file_path.S} ${event.Records[0].dynamodb.NewImage.input_text.S}
                             `;

        const userData = Buffer.from(data).toString('base64');

        const instanceParams = {
            ImageId: 'ami-0ddda618e961f2270',
            InstanceType: 't2.micro',
            MaxCount: 1,
            MinCount: 1,
            UserData: userData,
            IamInstanceProfile: {
                Arn: 'arn:aws:iam::730335631898:instance-profile/AWSEC2RoleAccess'
            },
            NetworkInterfaces: [
                 {
                     AssociatePublicIpAddress: true,
                     DeviceIndex: 0,
                     SubnetId: 'subnet-004c63a5f3a2e141a',
                     Groups: ['sg-047c6e708d8c2cd55']
                 }
            ]

        };

        const ec2Result = await ec2.runInstances(instanceParams).promise();
        const instanceId = ec2Result.Instances[0].InstanceId;

        console.log(`EC2 instance created with ID: ${instanceId}`);


    } catch (err) {
      console.error(err);

    }
  };
