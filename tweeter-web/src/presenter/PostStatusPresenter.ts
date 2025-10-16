import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { MessageView, Presenter, View } from "./Presenter";

export interface PostStatusView extends MessageView {
  setPost: (postMessage: string) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  statusService: StatusService = new StatusService();

  constructor(view: PostStatusView) {
    super(view);
  }

  public async submitPost(
    authToken: AuthToken,
    currentUser: User,
    post: string
  ) {
    let postingStatusToastId: string;
    this.doFailureReportingOperation(async () => {
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.statusService.postStatus(authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    }, "post the status");
    this.view.deleteMessage(postingStatusToastId!);
  }

  public checkButtonStatus(
    post: string,
    authToken: AuthToken,
    currentUser: User
  ): boolean {
    return !post.trim() || !authToken || !currentUser;
  }
}
