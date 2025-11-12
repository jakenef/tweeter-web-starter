import { PagedUserItemRequest } from "tweeter-shared";
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
    expect(response[1]).toBeTruthy();
  });

  it("registers successfully", async () => {
    expect(false).toBeTruthy;
  });

  it("gets following count successfully", async () => {
    expect(false).toBeTruthy();
  });
});
