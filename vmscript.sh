#!/bin/bash
# Set AWS default region
export AWS_DEFAULT_REGION=us-east-2

# Function to handle errors
handle_error() {
    echo "Error: $1"
    exit 1
}

# Check if required arguments are provided
if [ "$#" -ne 3 ]; then
    handle_error "Usage: $0 <input_file_name> <s3_input_file_path> <input_text>"
fi
        
touch /tmp/input.txt
# Download input file from S3
aws s3 cp "s3://$2" /tmp/input.txt || handle_error "Failed to download input file from S3"

# Append input text to input file and save as output file
inputText="$3"
echo "$(cat /tmp/input.txt) : $inputText" > /tmp/output.txt || handle_error "Failed to create output file"

# Upload output file to S3
outputFileNameS3="$1_output.out.txt"
aws s3 cp /tmp/output.txt "s3://fileappbucket/$outputFileNameS3" || handle_error "Failed to upload output file to S3"

# Update DynamoDB with output file path
outputFileNameDynamo="$1_output.out..txt"
aws dynamodb update-item --table-name MyFile \
--key '{"id": {"S": "'$1'"}}' \
--update-expression 'SET output_file_path = :path' \
--expression-attribute-values '{":path":{"S":"fileappbucket/'$outputFileNameDynamo'"}}' \
--region us-east-2 || handle_error "Failed to update DynamoDB"


shutdown -h now || handle_error "Failed to shut down the instance"
