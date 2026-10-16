import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Pagination from "../index.js";

const pageButtons = () =>
  within(screen.getByRole("list"))
    .getAllByRole("button", { name: /^Page / })
    .map((b) => b.textContent);

describe("Pagination", () => {
  it("is a navigation landmark named Pagination", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);

    expect(
      screen.getByRole("navigation", { name: "Pagination" })
    ).toBeVisible();
  });

  it("marks the current page", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("lists every page when they all fit", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);

    expect(pageButtons()).toEqual(["1", "2", "3"]);
  });

  it("shows gaps for long ranges", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={() => {}} />);

    expect(pageButtons()).toEqual(["1", "4", "5", "6", "10"]);
  });

  it.each([
    ["Previous page", 1],
    ["Next page", 3],
    ["Page 3", 3],
  ])("reports the page %s goes to from page 2", async (name, expected) => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name }));

    expect(onPageChange).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it("doesn't report the current page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "Page 2" }));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it.each([
    [1, "Previous page"],
    [3, "Next page"],
  ])("disables on page %i of 3: %s", (page, name) => {
    render(<Pagination page={page} pageCount={3} onPageChange={() => {}} />);

    expect(screen.getByRole("button", { name })).toBeDisabled();
  });

  it("clamps an out-of-range page", () => {
    render(<Pagination page={9} pageCount={3} onPageChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it.each([
    [3, 10, 240, "51–75 of 240"],
    [10, 10, 240, "226–240 of 240"],
    [1, 0, 0, "No results"],
  ])(
    "summarises page %i of %i with %i items as %s",
    (page, pageCount, total, summary) => {
      render(
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={() => {}}
          total={total}
          pageSize={25}
        />
      );

      expect(screen.getByText(summary)).toBeVisible();
    }
  );

  it("changes the page size", async () => {
    const user = userEvent.setup();
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageCount={4}
        onPageChange={() => {}}
        pageSize={25}
        pageSizeOptions={[10, 25, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    );

    await user.selectOptions(screen.getByLabelText("Rows per page"), "50");

    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
