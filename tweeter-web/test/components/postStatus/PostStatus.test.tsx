import { MemoryRouter } from "react-router-dom";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { anything, instance, mock, verify, when } from "@typestrong/ts-mockito";
import { useUserInfo } from "../../../src/components/userInfo/UserHooks";
import { Status } from "../../../../tweeter-shared/src/model/domain/Status";
import { User } from "../../../../tweeter-shared/src/model/domain/User";
import { AuthToken } from "../../../../tweeter-shared/src/model/domain/AuthToken";

jest.mock("../../../src/components/userInfo/UserHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

describe("PostStatus component", () => {
  const mockUserInstance = new User("first", "last", "@alias", "imageUrl");
  const mockAuthTokenInstance = new AuthToken("token", Date.now());

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("starts with Post Status and Clear buttons disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables both buttons when text field has text", async () => {
    const { postStatusButton, clearButton, statusField, user } =
      renderPostStatusAndGetElements();
    await user.type(statusField, "Hello world!");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables both buttons when text field is cleared", async () => {
    const { postStatusButton, clearButton, statusField, user } =
      renderPostStatusAndGetElements();
    await user.type(statusField, "Hello world!");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
    await user.clear(statusField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls submitPost with correct parameters when Post Status button is pressed", async () => {
    const presenter = PostStatusPresenter.prototype;
    const submitPostSpy = jest
      .spyOn(presenter, "submitPost")
      .mockImplementation(jest.fn());
    const statusText = "Test status!";
    const { postStatusButton, statusField, user } =
      renderPostStatusAndGetElements();
    await user.type(statusField, statusText);
    await user.click(postStatusButton);
    expect(submitPostSpy).toHaveBeenCalledWith(
      mockAuthTokenInstance,
      mockUserInstance,
      statusText
    );
    submitPostSpy.mockRestore();
  });
});

function renderPostStatus() {
  return render(
    <MemoryRouter>
      <PostStatus />
    </MemoryRouter>
  );
}

function renderPostStatusAndGetElements() {
  const user = userEvent.setup();
  renderPostStatus();
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const statusField = screen.getByLabelText("postStatusTextArea");
  return { user, postStatusButton, clearButton, statusField };
}
