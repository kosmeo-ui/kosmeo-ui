import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SummaryRow from "../index.js";

const items = [
  { label: "Subtotal", value: "$90.00" },
  { label: "Tax", value: <strong>$10.00</strong> },
];

describe("SummaryRow", () => {
  it.each(["Subtotal", "$90.00", "Tax", "$10.00"])("shows %s", (text) => {
    render(<SummaryRow items={items} />);

    expect(screen.getByText(text)).toBeVisible();
  });
});
