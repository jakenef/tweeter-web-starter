import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";
import { ChangeEvent, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/UserHooks";
import {
  RegisterPresenter,
  RegisterView,
} from "../../../presenter/RegisterPresenter";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (
      event.key == "Enter" &&
      presenterRef.current!.isRegistrationFormValid(
        firstName,
        lastName,
        alias,
        password
      )
    ) {
      doRegister();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    presenterRef.current!.handleImageFile(file);
    setImageVersion((prev) => prev + 1);
  };

  const view: RegisterView = {
    displayErrorMessage,
    navigate,
    updateUserInfo,
  };

  const presenterRef = useRef<RegisterPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new RegisterPresenter(view);
  }

  const doRegister = async () => {
    try {
      setIsLoading(true);
      presenterRef.current!.doRegister(
        firstName,
        lastName,
        alias,
        password,
        rememberMe
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputFieldFactory = () => {
    return (
      <>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="firstNameInput"
            placeholder="First Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setFirstName(event.target.value)}
          />
          <label htmlFor="firstNameInput">First Name</label>
        </div>
        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            size={50}
            id="lastNameInput"
            placeholder="Last Name"
            onKeyDown={registerOnEnter}
            onChange={(event) => setLastName(event.target.value)}
          />
          <label htmlFor="lastNameInput">Last Name</label>
        </div>
        <AuthenticationFields
          onKeyDownFunction={registerOnEnter}
          setAlias={setAlias}
          setPassword={setPassword}
        />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {presenterRef.current!.imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img
                src={presenterRef.current!.imageUrl}
                className="img-thumbnail"
                alt=""
              ></img>
            </>
          )}
        </div>
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Algready registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={() =>
        !presenterRef.current!.isRegistrationFormValid(
          firstName,
          lastName,
          alias,
          password
        )
      }
      isLoading={isLoading}
      submit={doRegister}
    />
  );
};

export default Register;
