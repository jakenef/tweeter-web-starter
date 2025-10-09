import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";

export interface AppNavBarView {
  displayErrorMessage: (message: string) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
  navigate: (url: string) => void;
  clearUserInfo: () => void;
}

export class AppNavbarPresenter {
  userService: UserService = new UserService();
  view: AppNavBarView;

  constructor(view: AppNavBarView) {
    this.view = view;
  }

  public async logOut(authToken: AuthToken) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    try {
      await this.userService.logout(authToken!);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to log user out because of exception: ${error}`
      );
    }
  }
}
