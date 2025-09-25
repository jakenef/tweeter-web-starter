import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useMessageActions } from "../toaster/MessageHooks";

interface Props {
  icon: Parameters<typeof FontAwesomeIcon>["0"]["icon"];
  oAuthProvider: string;
}

const OAuthButton = (props: Props) => {
  const { displayInfoMessage } = useMessageActions();

  const displayInfoMessageWithDarkBackground = (message: string): void => {
    displayInfoMessage(message, 3000, "text-white bg-primary");
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
