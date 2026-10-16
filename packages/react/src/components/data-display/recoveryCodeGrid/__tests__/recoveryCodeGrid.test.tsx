import RecoveryCodeGrid, { RecoveryCodeGridProps } from "../index.js";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const codes = ["ab12-cd34", "ef56-gh78", "ij90-kl12"];

describe("RecoveryCodeGrid", () => {
  it("lists every code in order", () => {
    render(<RecoveryCodeGrid codes={codes} />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent)
    ).toEqual(codes);
  });

  it("numbers the codes when numbered is set", () => {
    render(<RecoveryCodeGrid codes={codes} numbered />);

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent)
    ).toEqual(["1.ab12-cd34", "2.ef56-gh78", "3.ij90-kl12"]);
  });

  it.each<[RecoveryCodeGridProps["columns"], string]>([
    [undefined, "k-recovery-code-grid k-recovery-code-grid-2col"],
    [1, "k-recovery-code-grid k-recovery-code-grid-1col"],
    [3, "k-recovery-code-grid k-recovery-code-grid-3col"],
  ])("lays the codes out in columns=%s", (columns, classes) => {
    render(<RecoveryCodeGrid codes={codes} columns={columns} />);

    expect(screen.getByRole("list")).toHaveClass(classes, { exact: true });
  });
});
