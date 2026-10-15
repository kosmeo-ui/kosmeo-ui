import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Pagination from "../index.js";

const pageButtons = () =>
  within(screen.getByRole("list"))
    .getAllByRole("button", { name: /^Page / })
    .map((b) => b.textContent);

describe("Pagination", () => {
  it("is a labelled navigation landmark marking the current page", () => {
    render(<Pagination page={2} pageCount={3} onPageChange={() => {}} />);
    expect(
      screen.getByRole("navigation", { name: "Pagination" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(pageButtons()).toEqual(["1", "2", "3"]);
  });

  it("shows gaps for long ranges", () => {
    render(<Pagination page={5} pageCount={10} onPageChange={() => {}} />);
    expect(pageButtons()).toEqual(["1", "4", "5", "6", "10"]);
  });

  it("navigates with previous, next and page buttons", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Previous page" })
    );
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("doesn't report the current page", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("disables previous on the first page and next on the last", () => {
    const { rerender } = render(
      <Pagination page={1} pageCount={3} onPageChange={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: "Previous page" })
    ).toBeDisabled();

    rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("clamps an out-of-range page", () => {
    render(<Pagination page={9} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("summarises the visible range", () => {
    const { rerender } = render(
      <Pagination
        page={3}
        pageCount={10}
        onPageChange={() => {}}
        total={240}
        pageSize={25}
      />
    );
    expect(screen.getByText("51–75 of 240")).toBeInTheDocument();

    rerender(
      <Pagination
        page={1}
        pageCount={0}
        onPageChange={() => {}}
        total={0}
        pageSize={25}
      />
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("changes the page size", async () => {
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
    await userEvent.selectOptions(screen.getByLabelText("Rows per page"), "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });
});
