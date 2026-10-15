import { toast } from "react-toastify";
import { useState } from "react";
import {
  Button,
  Form,
  FormActions,
  FormError,
  FormGrid,
  Input,
} from "@kosmeo-ui/react";

// Form checks every `required` field on submit, marks the empty ones, and
// only calls onSubmit when they're all filled in.
export const Forms = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Form
      onSubmit={() => {
        if (!email.includes("@")) {
          setError("That email address doesn't look right.");
          return;
        }
        setError(null);
        toast.success(`Saved ${name}`);
      }}
    >
      <FormGrid columns={2}>
        <Input
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormGrid>
      {error && <FormError>{error}</FormError>}
      <FormActions align="between">
        <Button
          variant="secondary"
          onClick={() => {
            setName("");
            setEmail("");
            setError(null);
          }}
        >
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </FormActions>
    </Form>
  );
};
