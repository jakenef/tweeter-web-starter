import { useContext, useRef } from "react";
import { UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";
import { AuthToken, User } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useNavigate } from "react-router-dom";
import {
  UserHookPresenter,
  UserHookView,
} from "../../presenter/UserHookPresenter";

interface UserInfoActions {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  clearUserInfo: () => void;
  setDisplayedUser: (user: User) => void;
}

interface UserNavigation {
  navigateToUser: (event: React.MouseEvent, url: string) => Promise<void>;
}

export const useUserInfo = () => {
  return useContext(UserInfoContext);
};

export const useUserInfoActions = (): UserInfoActions => {
  return useContext(UserInfoActionsContext);
};

export const useUserNavigation = (): UserNavigation => {
  const { displayErrorMessage } = useMessageActions();
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();

  const listener: UserHookView = {
    displayErrorMessage,
    navigate,
    setDisplayedUser,
  };

  const presenterRef = useRef<UserHookPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new UserHookPresenter(listener);
  }

  const navigateToUser = async (
    event: React.MouseEvent,
    url: string
  ): Promise<void> => {
    event.preventDefault();
    presenterRef.current!.navigateToUser(
      event,
      url,
      authToken!,
      displayedUser!
    );
  };

  return { navigateToUser };
};
