import { Status } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (event: any) => {
  const statusService = new StatusService();

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const followerAliases: string[] = body.followerAliases;
      const status: Status | null = Status.fromDto(body.status);
      if (!status) throw new Error("error parsing status");
      await statusService.processJobQueueMessage(followerAliases, status);
    } catch (err) {
      console.error("Error processing SQS record: ", {
        record,
        error: (err as Error).message,
      });
      throw err;
    }
  }
};
