import {
  FollowCountRequest,
  PagedUserItemRequest,
  RegisterRequest,
} from "tweeter-shared";
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
    const [users, hasMore] = await server.getMoreFollowers(request);

    expect(users).toBeDefined();
    expect(hasMore).toBeDefined();
    expect(hasMore).toBeTruthy();
  });

  it("registers successfully", async () => {
    const request: RegisterRequest = {
      firstName: "John",
      lastName: "Doe",
      alias: "@johndoe",
      password: "password123",
      userImageBytes: "",
      imageFileExtension: "jpg",
    };

    const [user, authToken] = await server.register(request);

    console.log(user);
    console.log(authToken);

    expect(user).toBeDefined();
    expect(authToken).toBeDefined();
    expect(user.alias[0]).toBe("@");
    expect(authToken.token.length).toBeGreaterThan(2);
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
