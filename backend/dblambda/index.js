exports.handler = async (event) => {
    let inputText;
    let inputFilePath;

    try {
      // Parse the request body
      const requestBody = event;
      inputText = requestBody.inputText;
      inputFilePath = requestBody.inputFilePath;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body' }),
      };
    }

    const AWS = require('aws-sdk');
    const dynamoDB = new AWS.DynamoDB({ region: "us-east-2" });
    const { nanoid } = await import('nanoid');

    const id = nanoid();

    const dynamoParams = {
      TableName: 'file-upload',
      Item: {
        id: { S: id },
        input_text: { S: inputText },
        input_file_path: { S: inputFilePath }
      }
    };

    try {
      const dynamoResult = await dynamoDB.putItem(dynamoParams).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({
          id,
          inputText,
          inputFilePath
        })
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error saving data to DynamoDB' })
      };
    }
  };
