import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";

export interface PostStatusView {
  setPost: (postMessage: string) => void;
  displayErrorMessage: (message: string) => void;
  displayInfoMessage: (message: string, duration: number) => void;
  deleteMessage: (messageId: string) => void;
}

export class PostStatusPresenter {
  statusService: StatusService = new StatusService();
  view: PostStatusView;

  constructor(view: PostStatusView) {
    this.view = view;
  }

  public async submitPost(
    authToken: AuthToken,
    currentUser: User,
    post: string
  ) {
    var postingStatusToastId;
    try {
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.statusService.postStatus(authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      );
    } finally {
      this.view.deleteMessage(postingStatusToastId!);
    }
  }

  public checkButtonStatus(
    post: string,
    authToken: AuthToken,
    currentUser: User
  ): boolean {
    return !post.trim() || !authToken || !currentUser;
  }
}
