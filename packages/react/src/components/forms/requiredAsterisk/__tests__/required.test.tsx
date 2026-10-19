import RichTextEditor from "../../../inputs/richTextEditor/index.js";
import CheckboxGroup from "../../../inputs/checkboxGroup/index.js";
import RadioGroup from "../../../inputs/radioGroup/index.js";
import TextArea from "../../../inputs/textArea/index.js";
import Checkbox from "../../../inputs/checkbox/index.js";
import { render, screen } from "@testing-library/react";
import Select from "../../../inputs/select/index.js";
import Input from "../../../inputs/input/index.js";
import { describe, expect, it } from "vitest";
import { ReactElement } from "react";

const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

describe("required fields", () => {
  it.each<[string, "textbox" | "combobox" | "checkbox", ReactElement]>([
    ["Input", "textbox", <Input label="Field" required />],
    ["TextArea", "textbox", <TextArea label="Field" required />],
    [
      "Select",
      "combobox",
      <Select label="Field" options={options} required value="a" />,
    ],
    [
      "Checkbox",
      "checkbox",
      <Checkbox label="Field" checked={false} onChange={() => {}} required />,
    ],
  ])(
    "keep the asterisk out of a required %s's name",
    (_name, role, element) => {
      render(element);

      expect(screen.getByRole(role, { name: "Field" })).toBeRequired();
    }
  );

  it("still show the asterisk", () => {
    render(<Input label="Email" required />);

    expect(screen.getByText("*")).toBeVisible();
  });

  it("style the asterisk", () => {
    render(<Input label="Email" required />);

    expect(screen.getByText("*")).toHaveClass("k-mandatory-asterisk", {
      exact: true,
    });
  });

  describe("radio group", () => {
    const RequiredRadioGroup = () => (
      <RadioGroup
        label="Size"
        name="size"
        options={options}
        value={null}
        onChange={() => {}}
        required
      />
    );

    it("is a named, required radiogroup", () => {
      render(<RequiredRadioGroup />);

      expect(screen.getByRole("radiogroup", { name: "Size" })).toHaveAttribute(
        "aria-required",
        "true"
      );
    });

    it.each(["A", "B"])("marks radio %s required", (label) => {
      render(<RequiredRadioGroup />);

      expect(screen.getByRole("radio", { name: label })).toBeRequired();
    });
  });

  describe("checkbox group", () => {
    it("is named by its label", () => {
      render(
        <CheckboxGroup
          label="Access"
          name="access"
          options={options}
          values={[]}
          onChange={() => {}}
        />
      );

      expect(screen.getByRole("group", { name: "Access" })).toBeVisible();
    });

    it("says it's required in its name", () => {
      render(
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
      ).toBeVisible();
    });
  });

  it("mark a required rich text editor", async () => {
    render(<RichTextEditor label="Body" required />);

    expect(
      await screen.findByRole("textbox", { name: "Body" })
    ).toHaveAttribute("aria-required", "true");
  });
});
