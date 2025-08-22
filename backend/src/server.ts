import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"
import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider"
import { config, getJson } from "serpapi"

dotenv.config();

const app = express();
const port = process.env.EXPRESS_PORT;
const awsRegion = process.env.AWS_REGION
const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID 
const clientId = process.env.AWS_COGNITO_CLIENT_ID
const username =  process.env.USERNAME
const password =  process.env.PASSWORD

if (!awsRegion || !userPoolId || !clientId) {
  throw new Error('❌ Missing required Cognito environment variables');
}

const congnitoClient = new CognitoIdentityProviderClient({region: awsRegion});
const input = {
  UserPoolId: userPoolId,
  AttributesToGet: ["email", "name"],
  Limit: 5,
};

const loginCommand= new InitiateAuthCommand({
  AuthFlow: "USER_PASSWORD_AUTH",
  ClientId: clientId,
  AuthParameters: {
    USERNAME: username,
    PASSWORD: password,
  },
});
const cognitoResponse = await congnitoClient.send(cognitoCommand);
console.log(cognitoResponse);

// const serpApiKey = process.env.SERP_API_KEY;

// const serpParams = {
//   engine: "google",
//   q: "Coffee",
//   api_key: serpApiKey,
// };

// const serpResponse = await getJson(serpParams);
// console.log(serpResponse);

// const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
// if (!AWS_ACCESS_KEY_ID) {
//   throw new Error('❌ AWS_ACCESS_KEY_ID environment variable is required');
// }

// const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
// if (!AWS_SECRET_ACCESS_KEY) {
//   throw new Error('❌ AWS_SECRET_ACCESS_KEY environment variable is required');
// }

// if (!awsRegion) {
//   throw new Error('❌ awsRegion environment variable is required');
// }

// const s3Client = new S3Client({
//   region: awsRegion,
//   credentials: {
//     accessKeyId: AWS_ACCESS_KEY_ID!, 
//     secretAccessKey: AWS_SECRET_ACCESS_KEY!,
//   }
// });

// const dynamoDBClient = new DynamoDBClient({
//   region: awsRegion,
//   credentials: {
//     accessKeyId: AWS_ACCESS_KEY_ID!,
//     secretAccessKey: AWS_SECRET_ACCESS_KEY!,
//   }
// });

// const s3ListBucketCommand = new ListBucketsCommand();
// const s3Response = await s3Client.send(s3ListBucketCommand);
// console.log(s3Response)

// const dydbListTableCommand = new ListTablesCommand();
// const dydbResponse = await dynamoDBClient.send(dydbListTableCommand)
// console.log(dydbResponse)

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

app.get("/aws", (req, res) =>{
  res.json({message: "AWS Services endpoint"});
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
