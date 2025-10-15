import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export interface LoginView extends View {
  navigate: (url: string) => void;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
}

export class LoginPresenter extends Presenter<LoginView> {
  private userService: UserService = new UserService();

  constructor(view: LoginView) {
    super(view);
  }

  public doLogin = async (
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl: string | undefined
  ) => {
    this.doFailureReportingOperation(async () => {
      const [user, authToken] = await this.userService.login(alias, password);

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
      return true;
    }, "log user in");
  };

  public isLoginFormValid = (alias: string, password: string): boolean => {
    return alias?.trim().length > 0 && password?.trim().length > 0;
  };
}
