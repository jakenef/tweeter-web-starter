import { useContext } from "react";
import { UserInfoActionsContext, UserInfoContext } from "./UserInfoContexts";
import { AuthToken, User } from "tweeter-shared";

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

export const useUserInfo = () => {
  return useContext(UserInfoContext);
};

export const useUserInfoActions = (): UserInfoActions => {
  return useContext(UserInfoActionsContext);
};
