import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"
import jwt from 'jsonwebtoken';
// import { CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider"
import { config, getJson } from "serpapi"
import axios from 'axios';
import jwksClient from 'jwks-rsa';

dotenv.config();

const app = express();
const port = process.env.EXPRESS_PORT;
const awsRegion = process.env.AWS_REGION;
const userPoolId = process.env.AWS_COGNITO_USER_POOL_ID ;
const clientId = process.env.AWS_COGNITO_CLIENT_ID;
const crawlerFuncUrl = process.env.CRAWLER_FUNC_URL;
const cognitoPublicKey = `https://cognito-idp.${awsRegion}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

const crawlUrl = "https://strata.cx/"
const user_id="3b5909ef-8a04-4b71-9aa7-ab4ca45e7ca7"

fetch(crawlerFuncUrl+"?url="+crawlUrl+"&user_id="+user_id).then(res => res.json()).then(data =>console.log(data));
// const username =  process.env.USERNAME
// const password =  process.env.PASSWORD

// if (!awsRegion || !userPoolId || !clientId) {
//   throw new Error('❌ Missing required Cognito environment variables');
// }

// const congnitoClient = new CognitoIdentityProviderClient({region: awsRegion});
// const input = {
//   UserPoolId: userPoolId,
//   AttributesToGet: ["email", "name"],
//   Limit: 5,
// };

// const loginCommand= new InitiateAuthCommand({
//   AuthFlow: "USER_PASSWORD_AUTH",
//   ClientId: clientId,
//   AuthParameters: {
//     USERNAME: username,
//     PASSWORD: password,
//   },
// });
// const cognitoResponse = await congnitoClient.send(cognitoCommand);
// console.log(cognitoResponse);

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


// Define proper types
interface AuthenticatedUser {
  sub: string;
  email: string;
  name?: string;
  // Add other Cognito user attributes as needed
}

// Make user optional in the interface
interface AuthenticatedRequest extends express.Request {
  user?: AuthenticatedUser; // Make it optional
}

// Update the middleware with proper typing
const verifyJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, cognitoPublicKey!) as AuthenticatedUser;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use type assertion in the route handler
app.get('/api/protected', verifyJWT, (req: express.Request, res: express.Response) => {
  const authenticatedReq = req as AuthenticatedRequest;
  res.json({ data: 'protected', user: authenticatedReq.user });
});

// app.get("", async (req, res) => {
//   try {

//   } catch (error) {
//     console.error("Crawler error", error);
//     res.status(500).json({
//       error: "Failed to crawl URl",
//       details: error instanceof Error ? error.message : "Unknow error"
//     });
//   }
// });

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
