import { AuthToken } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Presenter, View } from "./Presenter";

export interface AppNavBarView extends View {
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
  navigate: (url: string) => void;
  clearUserInfo: () => void;
}

export class AppNavbarPresenter extends Presenter<AppNavBarView> {
  userService: UserService = new UserService();

  constructor(view: AppNavBarView) {
    super(view);
  }

  public async logOut(authToken: AuthToken) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);
    await this.doFailureReportingOperation(async () => {
      await this.userService.logout(authToken!);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out");
  }
}
