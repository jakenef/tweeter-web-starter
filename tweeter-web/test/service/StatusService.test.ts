import { AuthToken } from "tweeter-shared";
import { StatusService } from "../../src/model.service/StatusService";
import "isomorphic-fetch";

describe("StatusService tests", () => {
  const statusService = new StatusService();

  it("returns a page of statuses for the story", async () => {
    const [statusItems, hasMore] = await statusService.loadMoreStoryItems(
      new AuthToken("fake", 2),
      "@faker",
      2,
      null
    );

    expect(statusItems).toBeDefined();
    expect(statusItems.length).toBe(2);
    expect(hasMore).toBe(true);
  });
});
