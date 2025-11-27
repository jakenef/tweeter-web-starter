import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthDao, AuthTokenData } from "./AuthDao";
import { Dao } from "./Dao";

export class AuthDaoDynamo extends Dao implements AuthDao {
  readonly tableName = "authtoken_table";
  readonly tokenAttributeName = "token";
  readonly timestampAttributeName = "timestamp";
  readonly userAliasAttributeName = "user_alias";

  async createAuthToken(
    token: string,
    userAlias: string,
    timestamp: number
  ): Promise<void> {
    const authTokenItem: Record<string, any> = {
      [this.tokenAttributeName]: token,
      [this.userAliasAttributeName]: userAlias,
      [this.timestampAttributeName]: timestamp,
    };

    const params = {
      TableName: this.tableName,
      Item: authTokenItem,
    };

    await this.client.send(new PutCommand(params));
  }

  async deleteAuthToken(token: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.tokenAttributeName]: token,
      },
    };

    await this.client.send(new DeleteCommand(params));
  }

  async getAuthToken(token: string): Promise<AuthTokenData | null> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttributeName]: token },
    };

    const result = await this.client.send(new GetCommand(params));
    if (!result.Item) {
      return null;
    }

    const resultAuthTokenData: AuthTokenData = {
      token: result.Item?.[this.tokenAttributeName],
      timestamp: result.Item?.[this.timestampAttributeName],
      userAlias: result.Item?.[this.userAliasAttributeName],
    };
    return resultAuthTokenData;
  }

  async updateAuthTokenTimestamp(
    token: string,
    timestamp: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.tokenAttributeName]: token },
      UpdateExpression: "SET #ts = :ts",
      ExpressionAttributeNames: { "#ts": this.timestampAttributeName },
      ExpressionAttributeValues: { ":ts": timestamp },
    };

    await this.client.send(new UpdateCommand(params));
  }
}
