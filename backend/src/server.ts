import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb"

dotenv.config();

const app = express();
const PORT = process.env.EXPRESS_PORT;

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
if (!AWS_ACCESS_KEY_ID) {
  throw new Error('❌ AWS_ACCESS_KEY_ID environment variable is required');
}

const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
if (!AWS_SECRET_ACCESS_KEY) {
  throw new Error('❌ AWS_SECRET_ACCESS_KEY environment variable is required');
}

const AWS_REGION = process.env.AWS_REGION
if (!AWS_REGION) {
  throw new Error('❌ AWS_REGION environment variable is required');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!, 
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  }
});

const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID!,
    secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  }
});

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
