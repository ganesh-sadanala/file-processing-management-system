import React, { useState } from "react";
import axios from "axios";
import AWS from 'aws-sdk';

 function FileUploadForm() {
   const [inputText, setInputText] = useState("");
   const [inputFile, setInputFile] = useState(null);

   function handleInputTextChange(event) {
     setInputText(event.target.value);
   }

   function handleInputFileChange(event) {
     const file = event.target.files[0];
     if (file) {
       setInputFile(file);
     } else {
       setInputFile(null);
     }
   }

   async function getPresignedUrl() {
     try {
       // Lambda API endpoint
       const requestBody = {
         fileName: inputFile.name,
         fileType: inputFile.type
       };

       const response = await axios.post(
         'https://hipdom6t3b.execute-api.us-east-2.amazonaws.com/default/generate-pre-signed-url', requestBody
       );

       // Lambda returns the pre-signed URL in the response data
       const url=JSON.parse(response.data.body);

       return url.url;
     } catch (error) {
       console.error('Error fetching pre-signed URL:', error);
       throw error;
     }
   }

    async function uploadFileToS3(url) {
      try {
          await axios.put(
              url, inputFile, {
                headers:{
                    'Content-Type': inputFile.type
                }
              }
          );

          console.log("File uploaded to s3 successfully");
        } catch (error) {
          console.error("Error uploading file:", error);
          throw error;
      }
    }

    async function uploadFileToDynamoDB() {
         try {
           const requestBody = {
                'inputText': inputText,
                'inputFilePath': `fileappbucket/${inputFile.name}`
              };

           const response = await axios.post(
             'https://7uv3zpxu83.execute-api.us-east-2.amazonaws.com/default/upload',
             requestBody
           );

           console.log("File uploaded to dynamodb successfully");
         } catch (error) {
           console.error("Error uploading file:", error);
           throw error;
         }
       }

   const handleSubmit = async (event) => {
     event.preventDefault();

     try {
       // Request pre-signed URL from Lambda function
       const url = await getPresignedUrl()

        // Upload file directly to S3 using pre-signed URL
        await uploadFileToS3(url);


       await uploadFileToDynamoDB();

       // Reset input fields
       setInputText("");
       setInputFile(null);
     } catch (error) {
       console.error("Error uploading file:", error);
     }
   };

   return (
     <div className="flex flex-col items-center">
       <form onSubmit={handleSubmit}>
         <div className="mb-4">
           <label htmlFor="inputText" className="block text-gray-700 font-bold mb-2">
             Text input:
           </label>
           <input
             id="inputText"
             type="text"
             value={inputText}
             onChange={handleInputTextChange}
             className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
           />
         </div>
         <div className="mb-4">
           <label htmlFor="inputFile" className="block text-gray-700 font-bold mb-2">
             File input:
           </label>
           <input
             id="inputFile"
             type="file"
             onChange={handleInputFileChange}
             className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
           />
         </div>
         <button
           type="submit"
           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
           disabled={!inputFile}
         >
           Submit
         </button>
       </form>
     </div>
   );
 }

 export default FileUploadForm;
