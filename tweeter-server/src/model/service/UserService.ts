import { UserDto, AuthTokenDto } from "tweeter-shared";
import { Service } from "./Service";
import { AuthService } from "./AuthService";
import { DaoFactory } from "../dao/DaoFactory";
import { compare } from "bcryptjs";
import { UserData } from "../dao/UserDao";

export class UserService implements Service {
  private readonly authService = new AuthService();
  private readonly factory = new DaoFactory();
  private readonly userDao = this.factory.getUserDao();
  private readonly storageDao = this.factory.getStorageDao();

  public async getUser(
    authToken: string,
    alias: string
  ): Promise<UserDto | null> {
    await this.authService.checkAuthorization(authToken);
    const user = await this.userDao.getUserData(alias);
    return user ? user.dto : null;
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[UserDto, AuthTokenDto]> {
    const user = await this.userDao.getUserData(alias);
    if (user) {
      const userAliasMatch = alias === user?.alias;
      const passwordMatch = await compare(password, user?.password!);
      if (userAliasMatch && passwordMatch) {
        const authToken = await this.authService.createAuthToken(alias);
        return [user.dto, authToken.dto];
      }
    }
    throw new Error("Unauthorized: Invalid username or password");
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBytesBase64: string,
    imageFileExtension: string
  ): Promise<[UserDto, AuthTokenDto]> {
    if (imageFileExtension != "png") {
      throw new Error("Bad Request: File format not supported");
    }
    const aliasTaken = (await this.userDao.getUserData(alias)) ? true : false;
    if (aliasTaken) {
      throw new Error("Bad Request: Alias is already taken");
    }

    const imageUrl = await this.storageDao.createImage(
      userImageBytesBase64,
      `${alias}-profile.${imageFileExtension}`
    );
    const userData = new UserData(
      firstName,
      lastName,
      alias,
      imageUrl,
      password
    );

    await this.userDao.createUser(userData);
    const authToken = await this.authService.createAuthToken(alias);
    return [userData.dto, authToken.dto];
  }

  public async logout(token: string): Promise<void> {
    await this.authService.deleteAuthToken(token);
  }
}
