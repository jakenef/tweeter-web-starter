import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DataPage } from "../util/DataPage";
import { DynamoDao } from "./DynamoDao";
import { FollowDao } from "./FollowDao";

export class FollowDaoDynamo extends DynamoDao implements FollowDao {
  readonly tableName = "follow";
  readonly followerAttributeName = "follower_alias";
  readonly followeeAttributeName = "followee_alias";

  async createFollow(
    followerHandle: string,
    followeeHandle: string
  ): Promise<void> {
    const followItem: Record<string, any> = {
      [this.followerAttributeName]: followerHandle,
      [this.followeeAttributeName]: followeeHandle,
    };

    const params = {
      TableName: this.tableName,
      Item: followItem,
    };

    await this.client.send(new PutCommand(params));
  }

  async deleteFollow(
    followerHandle: string,
    followeeHandle: string
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAttributeName]: followerHandle,
        [this.followeeAttributeName]: followeeHandle,
      },
    };
    await this.client.send(new DeleteCommand(params));
  }

  async getFollowingPage(
    followerHandle: string,
    limit: number,
    lastFolloweeHandle: string | undefined
  ): Promise<DataPage<string>> {
    const params = {
      KeyConditionExpression: this.followerAttributeName + " = :follower",
      ExpressionAttributeValues: {
        ":follower": followerHandle,
      },
      TableName: this.tableName,
      Limit: limit,
      ExclusiveStartKey:
        lastFolloweeHandle === undefined
          ? undefined
          : {
              [this.followerAttributeName]: followerHandle,
              [this.followeeAttributeName]: lastFolloweeHandle,
            },
    };

    let items: string[] = [];
    const response = await this.client.send(new QueryCommand(params));
    const hasMorePages = response.LastEvaluatedKey !== undefined;
    response.Items?.forEach((item) =>
      items.push(item[this.followeeAttributeName])
    );
    return new DataPage<string>(items, hasMorePages);
  }

  async getFollowersPage(
    followeeHandle: string,
    limit: number,
    lastFollowerHandle: string | undefined
  ): Promise<DataPage<string>> {
    const params = {
      KeyConditionExpression: this.followeeAttributeName + " = :followee",
      ExpressionAttributeValues: {
        ":followee": followeeHandle,
      },
      TableName: this.tableName,
      Limit: limit,
      IndexName: "follow_index",
      ExclusiveStartKey:
        lastFollowerHandle === undefined
          ? undefined
          : {
              [this.followeeAttributeName]: followeeHandle,
              [this.followerAttributeName]: lastFollowerHandle,
            },
    };

    let items: string[] = [];
    const response = await this.client.send(new QueryCommand(params));
    const hasMorePages = response.LastEvaluatedKey !== undefined;
    response.Items?.forEach((item) =>
      items.push(item[this.followerAttributeName])
    );
    return new DataPage<string>(items, hasMorePages);
  }

  async isFollowing(
    followerHandle: string,
    followeeHandle: string
  ): Promise<boolean> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.followerAttributeName]: followerHandle,
        [this.followeeAttributeName]: followeeHandle,
      },
    };

    const result = await this.client.send(new GetCommand(params));
    return !!result.Item;
  }
}
