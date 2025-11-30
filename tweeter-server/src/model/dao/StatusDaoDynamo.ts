import { Status, User } from "tweeter-shared";
import { DataPage } from "../util/DataPage";
import { DynamoDao } from "./DynamoDao";
import { StatusDao } from "./StatusDao";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

type tableNames = "story_table" | "feed_table";

export class StatusDaoDynamo extends DynamoDao implements StatusDao {
  private readonly feedTableName = "feed_table";
  private readonly storyTableName = "story_table";
  private readonly userAliasAttributeName = "user_alias";
  private readonly timestampAttributeName = "timestamp";
  private readonly postAttributeName = "post";

  // storing a copy of basic user info to prevent multiple db calls
  private readonly userFirstnameAttributeName = "user_firstname";
  private readonly userLastnameAttributeName = "user_lastname";
  private readonly userImageUrlAttributeName = "user_image_url";

  private async createStatus(tableName: tableNames, status: Status) {
    const statusItem: Record<string, any> = {
      [this.userAliasAttributeName]: status.user.alias,
      [this.timestampAttributeName]: status.timestamp,
      [this.postAttributeName]: status.post,
      [this.userFirstnameAttributeName]: status.user.firstName,
      [this.userLastnameAttributeName]: status.user.lastName,
      [this.userImageUrlAttributeName]: status.user.imageUrl,
    };

    const params = {
      TableName: tableName,
      Item: statusItem,
    };

    await this.client.send(new PutCommand(params));
  }

  private async getStatusPage(
    tableName: tableNames,
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ) {
    const params = {
      KeyConditionExpression: this.userAliasAttributeName + " = :userAlias",
      ExpressionAttributeValues: {
        ":userAlias": userAlias,
      },
      TableName: tableName,
      Limit: limit,
      ExclusiveStartKey:
        lastTimestamp === undefined
          ? undefined
          : {
              [this.userAliasAttributeName]: userAlias,
              [this.timestampAttributeName]: lastTimestamp,
            },
    };

    let items: Status[] = [];
    const response = await this.client.send(new QueryCommand(params));
    const hasMorePages = response.LastEvaluatedKey !== undefined;
    response.Items?.forEach((item) => {
      const responseStatus = new Status(
        item[this.postAttributeName],
        new User(
          item[this.userFirstnameAttributeName],
          item[this.userLastnameAttributeName],
          item[this.userAliasAttributeName],
          item[this.userImageUrlAttributeName]
        ),
        item[this.timestampAttributeName]
      );
      items.push(responseStatus);
    });

    return new DataPage<Status>(items, hasMorePages);
  }

  async createStoryStatus(status: Status): Promise<void> {
    await this.createStatus(this.storyTableName, status);
  }

  async createFeedStatus(status: Status): Promise<void> {
    await this.createStatus(this.feedTableName, status);
  }

  async getStoryPageByAlias(
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<DataPage<Status>> {
    return await this.getStatusPage(
      this.storyTableName,
      userAlias,
      limit,
      lastTimestamp
    );
  }

  async getFeedPageByAlias(
    userAlias: string,
    limit: number,
    lastTimestamp?: number
  ): Promise<DataPage<Status>> {
    return await this.getStatusPage(
      this.feedTableName,
      userAlias,
      limit,
      lastTimestamp
    );
  }
}
