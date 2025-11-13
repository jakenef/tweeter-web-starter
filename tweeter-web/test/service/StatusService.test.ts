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

    // Check array and type
    expect(Array.isArray(statusItems)).toBe(true);
    expect(typeof hasMore).toBe("boolean");

    // Check first status structure
    expect(statusItems[0].post).toBeDefined();
    expect(statusItems[0].user).toBeDefined();
    expect(statusItems[0].timestamp).toBeDefined();

    // Check user object within status
    expect(statusItems[0].user.firstName).toBeDefined();
    expect(statusItems[0].user.lastName).toBeDefined();
    expect(statusItems[0].user.alias).toBeDefined();
    expect(statusItems[0].user.alias[0]).toBe("@");

    // Check timestamp is a number
    expect(typeof statusItems[0].timestamp).toBe("number");
  });
});
