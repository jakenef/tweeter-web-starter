import { NavigateFunction } from "react-router-dom";
import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";

export interface LoginView {
  displayErrorMessage: (message: string) => void;
  navigate: NavigateFunction;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class LoginPresenter {
  private userService: UserService = new UserService();
  private view: LoginView;

  constructor(view: LoginView) {
    this.view = view;
  }

  public doLogin = async (
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) => {
    try {
      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
      return true;
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user in because of exception: ${error}`
      );
      return false;
    }
  };

  public isLoginFormValid = (alias: string, password: string): boolean => {
    return alias?.trim().length > 0 && password?.trim().length > 0;
  };
}
