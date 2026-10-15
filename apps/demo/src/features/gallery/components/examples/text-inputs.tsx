import { FormGrid, Input, TextArea } from "@kosmeo-ui/react";
import { useState } from "react";

export const TextInputs = () => {
  const [username, setUsername] = useState("ada");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("not-an-email");

  return (
    <FormGrid columns={2}>
      <Input
        label="Username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        showCharCount
        max={20}
        helperText="Shown on your public profile"
      />
      <Input label="Price" type="number" prefix="$" suffix="USD" />
      <Input
        label="With an error"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={email.includes("@") ? undefined : "Enter a valid email address"}
      />
      <Input label="Read-only" value="Can't touch this" readOnly />
      <Input label="Small" size="sm" placeholder={'size="sm"'} />
      <Input label="Large" size="lg" placeholder={'size="lg"'} />
      <TextArea
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Grows as you type (autoExpand)"
        autoExpand
        maxRows={6}
        showCharCount
        max={280}
      />
      <Input label="Password" type="password" autoComplete="new-password" />
    </FormGrid>
  );
};
