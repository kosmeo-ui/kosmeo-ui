import RichTextEditor from "../../../inputs/richTextEditor/index.js";
import CheckboxGroup from "../../../inputs/checkboxGroup/index.js";
import { render, screen, waitFor } from "@testing-library/react";
import RadioGroup from "../../../inputs/radioGroup/index.js";
import TextArea from "../../../inputs/textArea/index.js";
import Checkbox from "../../../inputs/checkbox/index.js";
import Select from "../../../inputs/select/index.js";
import Input from "../../../inputs/input/index.js";
import { describe, expect, it } from "vitest";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("required fields", () => {
  it("keep the asterisk out of the accessible name", () => {
    render(
      <>
        <Input label="Email" required />
        <TextArea label="Notes" required />
        <Select label="Plan" options={options} required value="a" />
        <Checkbox label="Agree" checked={false} onChange={() => {}} required />
      </>
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeRequired();
    expect(screen.getByRole("combobox", { name: "Plan" })).toBeRequired();
    expect(screen.getByRole("checkbox", { name: "Agree" })).toBeRequired();
  });

  it("still show the asterisk", () => {
    render(<Input label="Email" required />);
    expect(screen.getByText("*")).toHaveClass("k-mandatory-asterisk");
  });

  it("mark a radio group as a named, required radiogroup", () => {
    render(
      <RadioGroup
        label="Size"
        name="size"
        options={options}
        value={null}
        onChange={() => {}}
        required
      />
    );
    const group = screen.getByRole("radiogroup", { name: "Size" });
    expect(group).toHaveAttribute("aria-required", "true");
    for (const radio of screen.getAllByRole("radio"))
      expect(radio).toBeRequired();
  });

  it("name a checkbox group, saying it's required", () => {
    const { rerender } = render(
      <CheckboxGroup
        label="Access"
        name="access"
        options={options}
        values={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("group", { name: "Access" })).toBeInTheDocument();

    rerender(
      <CheckboxGroup
        label="Access"
        name="access"
        options={options}
        values={[]}
        onChange={() => {}}
        required
      />
    );
    expect(
      // jsdom's name computation drops the space before "(required)".
      screen.getByRole("group", { name: /^Access ?\(required\)$/ })
    ).toBeInTheDocument();
  });

  it("mark a required rich text editor", async () => {
    render(<RichTextEditor label="Body" required />);
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Body" })).toHaveAttribute(
        "aria-required",
        "true"
      )
    );
  });
});
