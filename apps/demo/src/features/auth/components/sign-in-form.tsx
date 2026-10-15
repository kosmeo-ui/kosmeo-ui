import { useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Form,
  FormActions,
  Input,
} from "@kosmeo-ui/react";

// No real auth: any email and password "sign in" after a short pause.
export const SignInForm = ({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    setTimeout(() => onSuccess(email), 700);
  };

  return (
    <Form onSubmit={submit}>
      <Col size="md">
        <Input
          label="Email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Checkbox
          label="Keep me signed in"
          labelLocation="right"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <FormActions align="fill">
          <Button type="submit" isLoading={loading}>
            Sign in
          </Button>
        </FormActions>
      </Col>
    </Form>
  );
};
