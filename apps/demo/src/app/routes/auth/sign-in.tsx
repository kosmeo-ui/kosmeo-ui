import { SignInForm } from "@/features/auth/components/sign-in-form";
import { AuthPage, Button } from "@kosmeo-ui/react";
import { useNavigate } from "react-router";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";

const SignInRoute = () => {
  const navigate = useNavigate();

  // This page sits outside the dashboard layout, so it provides its own <main>.
  return (
    <main>
      <AuthPage
        title="Sign in"
        subtitle="Any email and password will do — this is a demo."
        footer={
          <Button
            variant="link"
            onClick={() => navigate(paths.app.dashboard.getHref())}
          >
            Back to the demo
          </Button>
        }
      >
        <SignInForm
          onSuccess={(email) => {
            toast.success(`Signed in as ${email}`);
            navigate(paths.app.dashboard.getHref());
          }}
        />
      </AuthPage>
    </main>
  );
};

export default SignInRoute;
