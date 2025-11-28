import { User } from "tweeter-shared";
import { UserDao, UserData } from "./UserDao";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDao } from "./DynamoDao";
import { hash } from "bcryptjs";

export class UserDaoDynamo extends DynamoDao implements UserDao {
  readonly tableName = "user_table";
  readonly userAliasAttributeName = "user_alias";
  readonly passwordAttributeName = "password_hash";
  readonly firstNameAttributeName = "first_name";
  readonly lastNameAttributeName = "last_name";
  readonly imageUrlAttributeName = "image_url";

  async createUser(userData: UserData): Promise<void> {
    const passwordHash = await hash(userData.password, 10);
    const userItem: Record<string, any> = {
      [this.userAliasAttributeName]: userData.alias,
      [this.passwordAttributeName]: passwordHash,
      [this.firstNameAttributeName]: userData.firstName,
      [this.lastNameAttributeName]: userData.lastName,
      [this.imageUrlAttributeName]: userData.imageUrl,
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
}
