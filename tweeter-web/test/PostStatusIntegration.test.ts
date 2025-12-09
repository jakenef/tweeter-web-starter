import { StatusService } from "../src/model.service/StatusService";
import { ServerFacade } from "../src/network/ServerFacade";
import { mock, instance, verify, anything } from "ts-mockito";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../src/presenter/PostStatusPresenter";
import "isomorphic-fetch";

describe("post status integration test", () => {
  const serverFacade = new ServerFacade();
  const statusService = new StatusService();

  it("posts a status and can retrieve said status from user's story", async () => {
    // 1. Login a user
    const loginAlias = "@nefguyz";
    const loginPassword = "password";
    const [user, authToken] = await serverFacade.login({
      alias: loginAlias,
      password: loginPassword,
    });

    // 2. Create a mock view and presenter
    const mockView = mock<PostStatusView>();
    const mockViewInstance = instance(mockView);
    const presenter = new PostStatusPresenter(mockViewInstance);

    // 3. Post a status via the presenter
    const postText = "Integration test status " + Date.now();
    await presenter.submitPost(authToken, user, postText);

    // Wait for async operation to complete (since submitPost doesn't await doFailureReportingOperation)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. Verify "Status posted!" message was displayed to the user
    verify(mockView.displayInfoMessage("Status posted!", 2000)).once();

    // 5. Retrieve the user's story and verify the new status is present
    const [storyStatuses] = await statusService.loadMoreStoryItems(
      authToken,
      user.alias,
      10,
      null
    );
    const found = storyStatuses.find((s) => s.post === postText);
    expect(found).toBeDefined();
    expect(found?.user.alias).toBe(user.alias);
    expect(found?.post).toBe(postText);
    expect(typeof found?.timestamp).toBe("number");
  }, 10000);
});
