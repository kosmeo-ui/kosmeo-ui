import { hydrate, serverRender } from "../../__tests__/hydration.js";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ColorPicker from "../index.js";
import { useState } from "react";

const Harness = ({
  initialValue = "",
  onChange = () => {},
}: {
  initialValue?: string;
  onChange?: (hex: string) => void;
}) => {
  const [value, setValue] = useState(initialValue);
  return (
    <ColorPicker
      label="Brand"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
};

const field = () => screen.getByRole("textbox", { name: "Brand" });
const swatch = () => screen.getByLabelText("Brand swatch");

/**
 * Picks `hex` in the swatch's native colour dialog, which user-event cannot
 * open. The prototype setter bypasses React's value tracking, as a real pick
 * does, so React sees the change.
 */
const pickColor = (hex: string) =>
  act(() => {
    const input = swatch();
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )!.set!.call(input, hex);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

const DEFAULT_MESSAGE = "Color must be #RRGGBB (e.g. #A1B2C3)";

describe("ColorPicker", () => {
  describe("names", () => {
    it("names the hex field by its label", () => {
      render(<ColorPicker label="Brand" value="" onChange={() => {}} />);

      expect(field()).toBeVisible();
    });

    it("names the swatch after the label", () => {
      render(<ColorPicker label="Brand" value="" onChange={() => {}} />);

      expect(swatch()).toBeVisible();
    });

    it("names the swatch without a label", () => {
      render(<ColorPicker value="" onChange={() => {}} />);

      expect(screen.getByLabelText("Color swatch")).toBeVisible();
    });
  });

  describe("placeholder", () => {
    it("shows an example colour by default", () => {
      render(<ColorPicker label="Brand" value="" onChange={() => {}} />);

      expect(field()).toHaveAttribute("placeholder", "#A1B2C3");
    });

    it("shows a custom placeholder", () => {
      render(
        <ColorPicker
          label="Brand"
          value=""
          placeholder="#FFFFFF"
          onChange={() => {}}
        />
      );

      expect(field()).toHaveAttribute("placeholder", "#FFFFFF");
    });
  });

  describe("required", () => {
    it("shows an asterisk", () => {
      render(
        <ColorPicker label="Brand" value="" required onChange={() => {}} />
      );

      expect(screen.getByText("*")).toBeVisible();
    });

    it("marks the hex field required", () => {
      render(
        <ColorPicker label="Brand" value="" required onChange={() => {}} />
      );

      expect(field()).toBeRequired();
    });
  });

  describe("swatch", () => {
    it.each([
      ["#A1B2C3", "#a1b2c3"],
      ["  #A1B2C3  ", "#a1b2c3"],
      ["#A1B2C", "#000000"],
      ["", "#000000"],
    ])("shows %j as %s", (value, shown) => {
      render(<ColorPicker label="Brand" value={value} onChange={() => {}} />);

      expect(swatch()).toHaveValue(shown);
    });

    it("reports a colour picked in it", () => {
      const onChange = vi.fn();
      render(<Harness initialValue="#000000" onChange={onChange} />);

      pickColor("#ff0000");

      expect(onChange).toHaveBeenCalledWith("#ff0000");
    });

    it("shows a picked colour in the hex field", () => {
      render(<Harness initialValue="#000000" />);

      pickColor("#ff0000");

      expect(field()).toHaveValue("#ff0000");
    });
  });

  describe("hex field", () => {
    it("reports what is typed", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Harness onChange={onChange} />);

      await user.type(field(), "#A1B2C3");

      expect(onChange).toHaveBeenLastCalledWith("#A1B2C3");
    });

    it("shows a typed colour in the swatch", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(field(), "#A1B2C3");

      expect(swatch()).toHaveValue("#a1b2c3");
    });

    it("shows the error while a colour is half typed", async () => {
      const user = userEvent.setup();
      render(<Harness />);

      await user.type(field(), "#A1B");

      expect(screen.getByText(DEFAULT_MESSAGE)).toBeVisible();
    });
  });

  describe("validation", () => {
    it.each(["#A1B2C", "#A1B2C3D", "#FFF", "A1B2C3", "#GGGGGG", "#A1B2C3;"])(
      "rejects %j",
      (value) => {
        render(<ColorPicker label="Brand" value={value} onChange={() => {}} />);

        expect(screen.getByText(DEFAULT_MESSAGE)).toBeVisible();
      }
    );

    it.each(["#A1B2C3", "#a1b2c3", "  #A1B2C3  ", ""])(
      "accepts %j",
      (value) => {
        render(
          <ColorPicker
            label="Brand"
            value={value}
            allowEmpty
            onChange={() => {}}
          />
        );

        expect(screen.queryByText(DEFAULT_MESSAGE)).not.toBeInTheDocument();
      }
    );

    // Decided: an empty value is never an error, whatever allowEmpty says.
    it("shows no error for an empty value without allowEmpty", () => {
      render(<ColorPicker label="Brand" value="" onChange={() => {}} />);

      expect(screen.queryByText(DEFAULT_MESSAGE)).not.toBeInTheDocument();
    });

    it("shows a custom invalid message", () => {
      render(
        <ColorPicker
          label="Brand"
          value="#FFF"
          invalidMessage="Bad colour"
          onChange={() => {}}
        />
      );

      expect(screen.getByText("Bad colour")).toBeVisible();
    });

    it("shows the error prop for a valid colour", () => {
      render(
        <ColorPicker
          label="Brand"
          value="#A1B2C3"
          error="Already taken"
          onChange={() => {}}
        />
      );

      expect(screen.getByText("Already taken")).toBeVisible();
    });

    it("shows the error prop in place of the invalid message", () => {
      render(
        <ColorPicker
          label="Brand"
          value="#FFF"
          error="Already taken"
          onChange={() => {}}
        />
      );

      expect(screen.queryByText(DEFAULT_MESSAGE)).not.toBeInTheDocument();
    });
  });

  describe("server render", () => {
    it("hydrates without a mismatch", async () => {
      const element = () => <Harness initialValue="#A1B2C3" />;
      const container = serverRender(element());

      const { consoleError, onRecoverableError } = await hydrate(
        container,
        element()
      );

      expect(consoleError).not.toHaveBeenCalled();
      expect(onRecoverableError).not.toHaveBeenCalled();
    });
  });
});
