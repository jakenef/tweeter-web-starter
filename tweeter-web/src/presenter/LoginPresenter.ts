import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { View } from "./Presenter";
import { AuthActionPresenter } from "./AuthActionPresenter";

export interface LoginView extends View {
  navigate: (url: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class LoginPresenter extends AuthActionPresenter<LoginView> {
  private userService: UserService = new UserService();

  constructor(view: LoginView) {
    super(view);
  }

  public navigationAuth(
    originalUrl: string | undefined,
    user: User,
    rememberMe: boolean,
    authToken: AuthToken
  ): void {
    this.view.updateUserInfo(user, user, authToken, rememberMe);

    if (originalUrl) {
      this.view.navigate(originalUrl);
    } else {
      this.view.navigate(`/feed/${user.alias}`);
    }
  }

  public serviceAuth(
    userAlias: string,
    password: string,
    firstName?: string,
    lastName?: string,
    imageBytes?: Uint8Array,
    imageFileExtension?: string
  ): Promise<[User, AuthToken]> {
    return this.userService.login(userAlias, password);
  }

  public actionDescription(): string {
    return "log user in";
  }

  public doLogin = async (
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) => {
    await this.doAuthOperation(
      alias,
      password,
      rememberMe,
      originalUrl,
      undefined,
      undefined,
      undefined,
      undefined
    );
  };

  public isLoginFormValid = (alias: string, password: string): boolean => {
    return alias?.trim().length > 0 && password?.trim().length > 0;
  };
}
