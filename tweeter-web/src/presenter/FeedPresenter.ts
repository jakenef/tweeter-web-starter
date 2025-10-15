import { AuthToken } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { StatusItemPresenter, StatusItemView } from "./StatusItemPresenter";

export const PAGE_SIZE = 10;

export class FeedPresenter extends StatusItemPresenter {
  private statusService: StatusService;

  public constructor(view: StatusItemView) {
    super(view);
    this.statusService = new StatusService();
  }

  loadMoreItems = async (authToken: AuthToken, userAlias: string) => {
    await this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.statusService.loadMoreFeedItems(
        authToken,
        userAlias,
        PAGE_SIZE,
        this.lastItem
      );

      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, "load feed");
  };
}
