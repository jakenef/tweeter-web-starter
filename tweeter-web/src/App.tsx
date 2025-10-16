import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { useUserInfo } from "./components/userInfo/UserHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import UserItem from "./components/userItem/UserItem";
import StatusItem from "./components/statusItem/StatusItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  const statusItemComponent = (url: string) => {
    return (status: Status) => <StatusItem status={status} url={url} />;
  };

  const userItemComponent = (url: string) => {
    return (user: User) => <UserItem user={user} featurePath={url} />;
  };

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller<Status>
              key={`feed-${displayedUser!.alias}`}
              featureURL="/feed"
              presenterFactory={(view: PagedItemView<Status>) =>
                new FeedPresenter(view)
              }
              itemComponentFactory={statusItemComponent("/feed")}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status>
              key={`story-${displayedUser!.alias}`}
              featureURL="/story"
              presenterFactory={(view: PagedItemView<Status>) =>
                new StoryPresenter(view)
              }
              itemComponentFactory={statusItemComponent("/story")}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User>
              key={`followees-${displayedUser!.alias}`}
              featureURL="/followees"
              presenterFactory={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              itemComponentFactory={userItemComponent("/followees")}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User>
              key={`followers-${displayedUser!.alias}`}
              featureURL="/followers"
              presenterFactory={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              itemComponentFactory={userItemComponent("/followers")}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
