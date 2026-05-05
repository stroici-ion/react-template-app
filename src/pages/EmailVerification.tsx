import Title from "../components/UI/Title";
import Text from "../components/UI/Text";
import Page from "../components/layouts/Page";
import Card from "../components/UI/Card";

export default function EmailVerification() {
  return (
    <Page>
      <Card className="text-center">
        <Title text="Email Verification" className="mb-6 justify-center" />
        <Text
          text="We've sent a verification link to your email. Please click the link to verify your email."
          className="mb-6"
        />
      </Card>
    </Page>
  );
}
