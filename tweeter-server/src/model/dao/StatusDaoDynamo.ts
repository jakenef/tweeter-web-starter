import { Status, User } from "tweeter-shared";
import { DataPage } from "../util/DataPage";
import { DynamoDao } from "./DynamoDao";
import { StatusDao } from "./StatusDao";
import {
  BatchWriteCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

type tableNames = "story_table" | "feed_table";

export class StatusDaoDynamo extends DynamoDao implements StatusDao {
  private readonly feedTableName = "feed_table";
  private readonly storyTableName = "story_table";

  // keys
  private readonly feedOwnerAliasAttributeName = "feed_owner_alias";
  private readonly authorAliasAttributeName = "user_alias";
  private readonly timestampAttributeName = "timestamp";

  private readonly postAttributeName = "post";

  // storing a copy of basic author info to prevent multiple db calls
  private readonly userFirstnameAttributeName = "user_firstname";
  private readonly userLastnameAttributeName = "user_lastname";
  private readonly userImageUrlAttributeName = "user_image_url";

  private async createStatus(
    tableName: tableNames,
    status: Status,
    feedOwnerAlias?: string
  ) {
    const isFeed = tableName === this.feedTableName;

    const statusItem: Record<string, any> = {
      [isFeed
        ? this.feedOwnerAliasAttributeName
        : this.authorAliasAttributeName]: feedOwnerAlias ?? status.user.alias,
      [this.timestampAttributeName]: status.timestamp,
      [this.postAttributeName]: status.post,
      [this.authorAliasAttributeName]: status.user.alias,
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
    const isFeed = tableName === this.feedTableName;
    const partitionKeyName = isFeed
      ? this.feedOwnerAliasAttributeName
      : this.authorAliasAttributeName;
    const params = {
      KeyConditionExpression: partitionKeyName + " = :userAlias",
      ExpressionAttributeValues: {
        ":userAlias": userAlias,
      },
      TableName: tableName,
      Limit: limit,
      ScanIndexForward: false,
      ExclusiveStartKey:
        lastTimestamp === undefined
          ? undefined
          : {
              [partitionKeyName]: userAlias,
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
          item[this.authorAliasAttributeName],
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

  async createFeedStatus(
    status: Status,
    feedOwnerAlias: string
  ): Promise<void> {
    await this.createStatus(this.feedTableName, status, feedOwnerAlias);
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

  async batchCreateFeedStatuses(
    status: Status,
    feedOwnerAliases: string[]
  ): Promise<void> {
    if (feedOwnerAliases.length > 25) {
      throw new Error("batch size limit exceeded");
    }
    const putRequests = feedOwnerAliases.map((feedOwnerAlias) => ({
      PutRequest: {
        Item: {
          [this.feedOwnerAliasAttributeName]: feedOwnerAlias,
          [this.timestampAttributeName]: status.timestamp,
          [this.postAttributeName]: status.post,
          [this.authorAliasAttributeName]: status.user.alias,
          [this.userFirstnameAttributeName]: status.user.firstName,
          [this.userLastnameAttributeName]: status.user.lastName,
          [this.userImageUrlAttributeName]: status.user.imageUrl,
        },
      },
    }));

    let unprocessedItems: any[] = putRequests;
    let retryCount = 0;
    const maxRetries = 5;

    while (unprocessedItems.length > 0 && retryCount < maxRetries) {
      const params = {
        RequestItems: {
          [this.feedTableName]: unprocessedItems,
        },
      };

      const response = await this.client.send(new BatchWriteCommand(params));

      // Check if there are unprocessed items
      if (
        response.UnprocessedItems &&
        response.UnprocessedItems[this.feedTableName]
      ) {
        unprocessedItems = response.UnprocessedItems[this.feedTableName] || [];
        retryCount++;

        // Exponential backoff
        if (unprocessedItems.length > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, 100 * Math.pow(2, retryCount))
          );
        }
      } else {
        unprocessedItems = [];
      }
    }

    if (unprocessedItems.length > 0) {
      console.error(
        `Failed to process ${unprocessedItems.length} items after ${maxRetries} retries`
      );
      throw new Error(
        `Failed to write ${unprocessedItems.length} feed items after retries`
      );
    }
  }
}
