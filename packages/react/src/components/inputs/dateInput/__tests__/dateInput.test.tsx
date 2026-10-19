import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DateInput } from "../index.js";
import { useState } from "react";

// Owns the value like a real parent, and shows what onChange reported.
const Harness = ({ initial }: { initial: string | null }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DateInput label="Start" value={value} onChange={setValue} />
      <output aria-label="Reported">{value ?? "none"}</output>
    </>
  );
};

const field = () => screen.getByLabelText("Start");
const reported = () => screen.getByRole("status", { name: "Reported" });

describe("DateInput", () => {
  it("shows a date-only value on its calendar day", () => {
    render(<Harness initial="2026-10-14" />);

    expect(field()).toHaveValue("2026-10-14");
  });

  it("reports the picked day as yyyy-mm-dd", async () => {
    const user = userEvent.setup();
    render(<Harness initial={null} />);

    await user.type(field(), "2026-12-25");

    expect(reported()).toHaveTextContent("2026-12-25");
  });

  it("reports null when cleared", async () => {
    const user = userEvent.setup();
    render(<Harness initial="2026-10-14" />);

    await user.clear(field());

    expect(reported()).toHaveTextContent("none");
  });
});
