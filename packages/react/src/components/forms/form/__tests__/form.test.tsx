import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import Input from "../../../inputs/input/index.js";
import { describe, expect, it, vi } from "vitest";
import { ReactNode, useState } from "react";
import Form from "../index.js";

const Field = (props: {
  label: string;
  initial?: string;
  required?: boolean;
  pattern?: string;
  error?: ReactNode;
}) => {
  const [value, setValue] = useState(props.initial ?? "");
  return (
    <Input
      label={props.label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required={props.required}
      pattern={props.pattern}
      error={props.error}
    />
  );
};

const setup = (children: ReactNode, error?: ReactNode) => {
  const onSubmit = vi.fn();
  render(
    <Form onSubmit={onSubmit} error={error}>
      {children}
      <button type="submit">Save</button>
    </Form>
  );
  return { onSubmit };
};

const box = (name: string) => screen.getByRole("textbox", { name });

describe("Form", () => {
  it("submits when every field is valid", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup(<Field label="Name" initial="admin" required />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each([
    ["is empty", ""],
    ["holds only spaces", "   "],
  ])("does not submit when a required field %s", async (_case, initial) => {
    const user = userEvent.setup();
    const { onSubmit } = setup(
      <Field label="Name" initial={initial} required />
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("flags a value that does not match the field's pattern", async () => {
    const user = userEvent.setup();
    setup(<Field label="Name" initial="isaac admin" pattern="[a-z][a-z_]*" />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(box("Name")).toHaveAttribute("aria-invalid", "true");
  });

  it("leaves a valid field unmarked while another is flagged", async () => {
    const user = userEvent.setup();
    setup(
      <>
        <Field label="Name" required />
        <Field label="Description" initial="Optional" />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(box("Description")).not.toHaveAttribute("aria-invalid");
  });

  it.each([
    [1, "Check the highlighted field."],
    [2, "Check the 2 highlighted fields."],
  ])("says how many fields to check (%i)", async (count, message) => {
    const user = userEvent.setup();
    setup(
      <>
        <Field label="Name" required />
        <Field label="Display name" required initial={count > 1 ? "" : "x"} />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert")).toHaveTextContent(message);
  });

  it("moves focus to the first flagged field", async () => {
    const user = userEvent.setup();
    setup(
      <>
        <Field label="Name" initial="ok" />
        <Field label="Display name" required />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(box("Display name")).toHaveFocus();
  });

  it("clears a field's flag once it is fixed", async () => {
    const user = userEvent.setup();
    setup(<Field label="Name" required />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await user.type(box("Name"), "admin");

    expect(box("Name")).not.toHaveAttribute("aria-invalid");
  });

  it("drops the banner once every field is fixed", async () => {
    const user = userEvent.setup();
    setup(<Field label="Name" required />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await user.type(box("Name"), "admin");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not flag fields as they are edited before the first submit", async () => {
    const user = userEvent.setup();
    setup(<Field label="Name" pattern="[a-z]+" />);

    await user.type(box("Name"), "A B");

    expect(box("Name")).not.toHaveAttribute("aria-invalid");
  });

  it("shows its error prop above the fields", () => {
    setup(<Field label="Name" />, "Role name is taken");

    expect(screen.getByRole("alert")).toHaveTextContent("Role name is taken");
  });

  it("keeps an Input's own error when the field passes", async () => {
    const user = userEvent.setup();
    setup(<Field label="Name" initial="admin" error="Name is taken" />);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(box("Name")).toHaveAttribute("aria-invalid", "true");
  });

  it("skips a disabled field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Input label="Name" value="" onChange={() => {}} required disabled />
        <button type="submit">Save</button>
      </Form>
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
