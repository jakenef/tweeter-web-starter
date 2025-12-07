import { Status, StatusDto } from "tweeter-shared";
import { Service } from "./Service";
import { AuthService } from "./AuthService";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

export class StatusService extends Service {
  private readonly authService = new AuthService();
  private readonly statusDao = this.factory.getStatusDao();
  private readonly followDao = this.factory.getFollowDao();
  private readonly sqs = new SQSClient({ region: "us-east-2" });
  private readonly POST_QUEUE_URL =
    "https://sqs.us-east-2.amazonaws.com/982534393495/PostQueue";
  private readonly JOB_QUEUE_URL =
    "https://sqs.us-east-2.amazonaws.com/982534393495/JobQueue";

  loadMoreStoryItems = async (
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> => {
    await this.authService.checkAuthorization(token);
    const pageOfStatuses = await this.statusDao.getStoryPageByAlias(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );
    return [
      pageOfStatuses.values.map((status) => status.dto),
      pageOfStatuses.hasMorePages,
    ];
  };

  public async loadMoreFeedItems(
    token: string,
    userAlias: string,
    pageSize: number,
    lastItem: StatusDto | null
  ): Promise<[StatusDto[], boolean]> {
    await this.authService.checkAuthorization(token);
    const pageOfStatuses = await this.statusDao.getFeedPageByAlias(
      userAlias,
      pageSize,
      lastItem?.timestamp
    );
    return [
      pageOfStatuses.values.map((status) => status.dto),
      pageOfStatuses.hasMorePages,
    ];
  }

  public async postStatus(token: string, newStatus: StatusDto): Promise<void> {
    await this.authService.checkAuthorization(token);

    const authorAlias = await this.authService.getUserAliasFromToken(token);
    const status = Status.fromDto(newStatus);

    await this.statusDao.createStoryStatus(status!);

    const followersPage = await this.followDao.getFollowersPage(
      authorAlias!,
      Number.MAX_SAFE_INTEGER,
      undefined
    );
    const followerAliases = followersPage.values;

    for (const followerAlias of followerAliases) {
      await this.statusDao.createFeedStatus(
        new Status(status?.post!, status?.user!, status?.timestamp!),
        followerAlias
      );
    }
  }

  public async performantPostStatus(
    token: string,
    newStatus: StatusDto
  ): Promise<void> {
    await this.authService.checkAuthorization(token);
    const authorAlias = await this.authService.getUserAliasFromToken(token);
    const status = Status.fromDto(newStatus);

    await Promise.all([
      this.statusDao.createStoryStatus(status!),
      this.addToPostQueue(authorAlias!, status!),
    ]);
  }

  private async addToPostQueue(
    authorAlias: string,
    status: Status
  ): Promise<void> {
    const messageBody = JSON.stringify({
      authorAlias,
      status: status.dto,
    });

    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.POST_QUEUE_URL,
        MessageBody: messageBody,
      })
    );
  }

  private async addToJobQueue(
    status: Status,
    followerAliases: string[]
  ): Promise<void> {
    const messageBody = JSON.stringify({
      status: status.dto,
      followerAliases,
    });

    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.JOB_QUEUE_URL,
        MessageBody: messageBody,
      })
    );
  }

  public async processPostQueueMessage(authorAlias: string, status: Status) {
    let hasMorePages = true;
    let lastFollowerAlias = undefined;
    while (hasMorePages) {
      const followerPage = await this.followDao.getFollowersPage(
        authorAlias,
        25,
        lastFollowerAlias
      );
      const followerAliases = followerPage.values;
      if (followerAliases.length === 0) {
        break;
      }

      await this.addToJobQueue(status, followerAliases);
      hasMorePages = followerPage.hasMorePages;
      if (hasMorePages) {
        lastFollowerAlias = followerAliases[followerAliases.length - 1];
      }
    }
  }
}
