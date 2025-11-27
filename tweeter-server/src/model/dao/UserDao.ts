import { User } from "tweeter-shared";

export interface UserData extends User {
  password: string;
}

export interface UserDao {
  createUser(userData: UserData): Promise<void>;
  deleteUser(userAlias: string): Promise<void>;
  getUserData(userAlias: string): Promise<User | null>;
}
