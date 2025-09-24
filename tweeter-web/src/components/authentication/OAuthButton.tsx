import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastActionsContext } from "../toaster/ToastContexts";
import { ToastType } from "../toaster/Toast";

interface Props {
  icon: Parameters<typeof FontAwesomeIcon>["0"]["icon"];
  oAuthProvider: string;
}

const OAuthButton = (props: Props) => {
  const { displayToast } = useContext(ToastActionsContext);

  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayToast(
      ToastType.Info,
      message,
      3000,
      undefined,
      "text-white bg-primary"
    );
  };

  return (
    <button
      type="button"
      className="btn btn-link btn-floating mx-1"
      onClick={() =>
        displayInfoMessageWithDarkBackground(
          `${props.oAuthProvider} registration is not implemented.`
        )
      }
    >
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`${props.oAuthProvider.toLowerCase()}Tooltip`}>
            {props.oAuthProvider}
          </Tooltip>
        }
      >
        <FontAwesomeIcon icon={props.icon} />
      </OverlayTrigger>
    </button>
  );
};

export default OAuthButton;
