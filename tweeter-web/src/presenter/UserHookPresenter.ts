import { UserService } from "../model.service/UserService";
import { AuthToken, User } from "tweeter-shared";

export interface UserHookView {
  displayErrorMessage: (message: string) => void;
  navigate: (url: string) => void;
  setDisplayedUser: (user: User) => void;
}

export class UserHookPresenter {
  private userService: UserService = new UserService();
  private view: UserHookView;

  constructor(view: UserHookView) {
    this.view = view;
  }

  public navigateToUser = async (
    event: React.MouseEvent,
    url: string,
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> => {
    try {
      const alias = this.extractAlias(event.target.toString());

      const toUser = await this.userService.getUser(authToken!, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser!)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${url}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  };

  private extractAlias = (value: string): string => {
    const index = value.indexOf("@");
    return value.substring(index);
  };
}
