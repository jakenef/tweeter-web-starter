import OAuthButton from "./OAuthButton";

interface Props {
  oAuthHeading: string;
}

const OAuth = (props: Props) => {
  return (
    <>
      <h1 className="h5 mb-3 fw-normal">{props.oAuthHeading}</h1>
      <div className="text-center mb-3">
        <OAuthButton oAuthProvider="Google" icon={["fab", "google"]} />
        <OAuthButton oAuthProvider="Facebook" icon={["fab", "facebook"]} />
        <OAuthButton oAuthProvider="Twitter" icon={["fab", "twitter"]} />
        <OAuthButton oAuthProvider="LinkedIn" icon={["fab", "linkedin"]} />
        <OAuthButton oAuthProvider="Github" icon={["fab", "github"]} />
      </div>
    </>
  );
};

export default OAuth;
