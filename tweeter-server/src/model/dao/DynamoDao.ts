import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export class DynamoDao {
  protected readonly client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: "us-east-2" })
  );
}
