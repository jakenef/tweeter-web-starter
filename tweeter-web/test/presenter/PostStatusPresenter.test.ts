import { AuthToken, User, Status } from "tweeter-shared";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../src/presenter/PostStatusPresenter";
import {
  anything,
  capture,
  instance,
  mock,
  spy,
  verify,
  when,
} from "@typestrong/ts-mockito";
import { StatusService } from "../../src/model.service/StatusService";

describe("PostStatusPresenter", () => {
  let mockView: PostStatusView;
  let presenter: PostStatusPresenter;
  let mockService: StatusService;

  const authToken = new AuthToken("abc123", Date.now());
  const currentUser = new User("First", "Last", "@first", "imageUrl");
  const postText = "Hello from a test post";

  beforeEach(() => {
    mockView = mock<PostStatusView>();
    const mockViewInstance = instance(mockView);
    when(mockView.displayInfoMessage(anything(), 0)).thenReturn("messageId123");

    const presenterSpy = spy(new PostStatusPresenter(mockViewInstance));
    presenter = instance(presenterSpy);

    mockService = mock<StatusService>();
    when((presenterSpy as any).statusService).thenReturn(instance(mockService));
  });

  it("tells the view to display a posting status message", async () => {
    await presenter.submitPost(authToken, currentUser, postText);
    verify(mockView.displayInfoMessage("Posting status...", 0)).once();
  });

  it("calls postStatus on the status service with the correct status string and auth token", async () => {
    await presenter.submitPost(authToken, currentUser, postText);

    verify(mockService.postStatus(authToken, anything())).once();

    const [capturedAuth, capturedStatus] = capture(
      mockService.postStatus
    ).last();
    expect(capturedAuth).toEqual(authToken);
    expect(capturedStatus).toBeInstanceOf(Status);
    expect((capturedStatus as Status).post).toEqual(postText);
  });

  it("when successful, clears the info message, clears the post, and displays a status posted message", async () => {
    await presenter.submitPost(authToken, currentUser, postText);

    verify(mockView.deleteMessage("messageId123")).once();
    verify(mockView.setPost("")).once();
    verify(mockView.displayInfoMessage("Status posted!", 2000)).once();

    verify(mockView.displayErrorMessage(anything())).never();
  });

  it("when unsuccessful, clears the info message and displays an error message but does not clear the post or display a status posted message", async () => {
    const error = new Error("post failed");
    when(mockService.postStatus(anything(), anything())).thenThrow(error);

    await presenter.submitPost(authToken, currentUser, postText);

    verify(
      mockView.displayErrorMessage(
        `Failed to post the status because of exception: Error: post failed`
      )
    ).once();

    verify(mockView.deleteMessage("messageId123")).once();

    verify(mockView.setPost(anything())).never();
    verify(mockView.displayInfoMessage("Status posted!", 2000)).never();
  });
});
