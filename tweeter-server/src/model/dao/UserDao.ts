import { User } from "tweeter-shared";

export class UserData extends User {
  password: string;

  public constructor(
    firstName: string,
    lastName: string,
    alias: string,
    imageUrl: string,
    password: string
  ) {
    super(firstName, lastName, alias, imageUrl);
    this.password = password;
  }
}

export interface UserDao {
  createUser(userData: UserData): Promise<void>;
  deleteUser(userAlias: string): Promise<void>;
  getUserData(userAlias: string): Promise<UserData | null>;
  getUsersByAliases(aliases: string[]): Promise<User[]>;
}
