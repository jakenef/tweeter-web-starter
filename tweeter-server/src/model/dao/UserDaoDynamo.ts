import { UserDao, UserData } from "./UserDao";
import {
  BatchGetCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDao } from "./DynamoDao";
import { hash } from "bcryptjs";
import { User } from "tweeter-shared";

export class UserDaoDynamo extends DynamoDao implements UserDao {
  readonly tableName = "user_table";
  readonly userAliasAttributeName = "user_alias";
  readonly passwordAttributeName = "password_hash";
  readonly firstNameAttributeName = "first_name";
  readonly lastNameAttributeName = "last_name";
  readonly imageUrlAttributeName = "image_url";
  readonly followerCountAttributeName = "follower_count";
  readonly followingCountAttributeName = "following_count";

  async createUser(userData: UserData): Promise<void> {
    const passwordHash = await hash(userData.password, 10);
    const userItem: Record<string, any> = {
      [this.userAliasAttributeName]: userData.alias,
      [this.passwordAttributeName]: passwordHash,
      [this.firstNameAttributeName]: userData.firstName,
      [this.lastNameAttributeName]: userData.lastName,
      [this.imageUrlAttributeName]: userData.imageUrl,
      [this.followerCountAttributeName]: 0,
      [this.followingCountAttributeName]: 0,
    };

    const params = {
      TableName: this.tableName,
      Item: userItem,
    };

    await this.client.send(new PutCommand(params));
  }

  async deleteUser(userAlias: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: {
        [this.userAliasAttributeName]: userAlias,
      },
    };
    await this.client.send(new DeleteCommand(params));
  }

  async getUserData(userAlias: string): Promise<UserData | null> {
    const params = {
      TableName: this.tableName,
      Key: { [this.userAliasAttributeName]: userAlias },
    };
    const result = await this.client.send(new GetCommand(params));
    if (!result.Item) {
      return null;
    }

    const resultUser = new UserData(
      result.Item[this.firstNameAttributeName],
      result.Item[this.lastNameAttributeName],
      result.Item[this.userAliasAttributeName],
      result.Item[this.imageUrlAttributeName],
      result.Item[this.passwordAttributeName]
    );
    return resultUser;
  }

  async getUsersByAliases(aliases: string[]): Promise<User[]> {
    if (aliases.length === 0) return [];
    const requestItems = {
      [this.tableName]: {
        Keys: aliases.map((alias) => ({ alias })),
      },
    };
    const result = await this.client.send(
      new BatchGetCommand({ RequestItems: requestItems })
    );
    const items = result.Responses?.[this.tableName] ?? [];
    let users: User[] = items.map(
      (item) =>
        new User(
          item[this.firstNameAttributeName],
          item[this.lastNameAttributeName],
          item[this.userAliasAttributeName],
          item[this.imageUrlAttributeName]
        )
    );
    return users;
  }

  async getFollowerAndFollowingCounts(
    userAlias: string
  ): Promise<{ followerCount: number; followingCount: number } | null> {
    const params = {
      TableName: this.tableName,
      Key: { [this.userAliasAttributeName]: userAlias },
    };
    const result = await this.client.send(new GetCommand(params));
    if (!result.Item) {
      return null;
    }
    const followingCount = result.Item[this.followingCountAttributeName] ?? 0;
    const followerCount = result.Item[this.followerCountAttributeName] ?? 0;
    return { followerCount, followingCount };
  }

  async updateUserFollowingCount(
    userAlias: string,
    followingCount: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.userAliasAttributeName]: userAlias },
      UpdateExpression: `SET ${this.followingCountAttributeName} = :count`,
      ExpressionAttributeValues: {
        ":count": followingCount,
      },
    };
    await this.client.send(new UpdateCommand(params));
  }

  async updateUserFollowerCount(
    userAlias: string,
    followerCount: number
  ): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { [this.userAliasAttributeName]: userAlias },
      UpdateExpression: `SET ${this.followerCountAttributeName} = :count`,
      ExpressionAttributeValues: {
        ":count": followerCount,
      },
    };
    await this.client.send(new UpdateCommand(params));
  }
}
