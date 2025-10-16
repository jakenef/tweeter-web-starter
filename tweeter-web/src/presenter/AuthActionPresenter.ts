import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export abstract class AuthActionPresenter<V extends View> extends Presenter<V> {
  constructor(view: V) {
    super(view);
  }

  public async doAuthOperation(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string | undefined,
    firstName?: string,
    lastName?: string,

    imageBytes?: Uint8Array,
    imageFileExtension?: string
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const [user, authToken] = await this.serviceAuth(
        alias,
        password,
        firstName,
        lastName,
        imageBytes,
        imageFileExtension
      );

      this.navigationAuth(originalUrl, user, rememberMe, authToken);
      return true;
    }, this.actionDescription());
  }

  public abstract navigationAuth(
    originalUrl: string | undefined,
    user: User,
    rememberMe: boolean,
    authToken: AuthToken
  ): void;

  public abstract serviceAuth(
    userAlias: string,
    password: string,
    firstName?: string,
    lastName?: string,
    imageBytes?: Uint8Array,
    imageFileExtension?: string
  ): Promise<[User, AuthToken]>;

  public abstract actionDescription(): string;
}
