import { AuthPage, Button, Input } from "@kosmeo-ui/react";

// AuthPage fills the viewport; the demo frame shrinks it to fit here.
export const AuthPageExample = () => (
  <div className="demo-frame demo-frame-auth">
    <AuthPage
      title="Reset your password"
      subtitle="We'll email you a reset link."
      footer={<Button variant="link">Back to sign in</Button>}
    >
      <Input label="Email" type="email" />
      <Button fullWidth>Send link</Button>
    </AuthPage>
  </div>
);
