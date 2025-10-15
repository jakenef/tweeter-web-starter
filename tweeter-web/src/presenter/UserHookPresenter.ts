import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export interface UserHookView extends View {
  navigate: (url: string) => void;
  setDisplayedUser: (user: User) => void;
}

export class UserHookPresenter extends Presenter<UserHookView> {
  private userService: UserService = new UserService();

  constructor(view: UserHookView) {
    super(view);
  }

  public navigateToUser = async (
    event: React.MouseEvent,
    url: string,
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> => {
    await this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this.userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${url}/${toUser.alias}`);
        }
      }
    }, "get user");
  };

  private extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };
}
