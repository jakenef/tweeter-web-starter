import { FollowCountRequest, PagedUserItemRequest } from "tweeter-shared";
import { ServerFacade } from "../../src/network/ServerFacade";
import "isomorphic-fetch";

describe("ServerFacade Tests", () => {
  let server: ServerFacade;

  beforeEach(() => {
    server = new ServerFacade();
  });

  it("gets followers successfully", async () => {
    const request: PagedUserItemRequest = {
      lastItem: null,
      pageSize: 2,
      token: "fake_token",
      userAlias: "user1",
    };
    const response = await server.getMoreFollowers(request);

    expect(response).toBeDefined();
    // has more
    expect(response[1]).toBeTruthy();
  });

  it("registers successfully", async () => {
    fail("not implemented");
  });

  it("gets followee count successfully", async () => {
    const request: FollowCountRequest = {
      token: "fake_token",
      user: {
        alias: "@johndoe",
        firstName: "john",
        lastName: "doe",
        imageUrl: "www.ccc.com",
      },
    };

    const response = await server.getFolloweeCount(request);

    expect(response).toBeDefined();
    expect(typeof response).toBe("number");
  });
});
