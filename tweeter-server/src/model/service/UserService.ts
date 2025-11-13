import { Buffer } from "buffer";
import { FakeData, UserDto, AuthTokenDto } from "tweeter-shared";
import { Service } from "./Service";

export class UserService implements Service {
  public async getUser(
    authToken: string,
    alias: string
  ): Promise<UserDto | null> {
    // TODO: Replace with the result of calling server
    const user = FakeData.instance.findUserByAlias(alias);
    return user ? user.dto : null;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid alias or password");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytesBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    // Not needed now, but will be needed when you make the request to the server in milestone 3
    // userImageBytesBase64 is already a base64 string

    // TODO: Replace with the result of calling the server
    const user = FakeData.instance.firstUser;

    if (user === null) {
      throw new Error("Invalid registration");
    }

    return [user.dto, FakeData.instance.authToken.dto];
  }

  public async logout(token: string): Promise<void> {}
}
