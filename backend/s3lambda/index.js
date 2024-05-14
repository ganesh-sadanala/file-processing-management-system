exports.handler = async (event) => {
  const AWS = require('aws-sdk');
  const s3 = new AWS.S3({region: 'us-east-2'});
  let fileName, fileType;

    try {
      // Parse the request body
      const requestBody = event;
      fileName = requestBody.fileName;
      fileType = requestBody.fileType;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

  const params = {
    Bucket: 'fileappbucket',
    Key: fileName,
    Expires: 60 * 60,
    ContentType: requestBody.fileType,
  };

  try {
    // Generate pre-signed URL
    const signedUrl = s3.getSignedUrl('putObject', params);

    console.log("I am printing the signedUrl: ", signedUrl)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate pre-signed URL' }),
    };
  }
};
