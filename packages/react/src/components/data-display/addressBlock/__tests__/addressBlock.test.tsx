import { render, screen, within } from "@testing-library/react";
import AddressBlock, { AddressBlockAddress } from "../index.js";
import { describe, expect, it } from "vitest";

const full: AddressBlockAddress = {
  name: "Ada Lovelace",
  company: "Acme",
  street1: "1 Main St",
  street2: "Suite 2",
  city: "Springfield",
  stateProvince: "IL",
  postalCode: "62701",
  countryCode: "US",
  phone: "555-0100",
  email: "ada@acme.test",
};

const empty: AddressBlockAddress = {
  name: null,
  company: null,
  street1: null,
  street2: null,
  city: null,
  stateProvince: null,
  postalCode: null,
  countryCode: null,
  phone: null,
  email: null,
};

/** The text of each line in the <address>, in order. */
const lines = () =>
  within(screen.getByRole("group"))
    .queryAllByText(/.+/)
    .map((line) => line.textContent);

describe("AddressBlock", () => {
  it("renders every line of a full address", () => {
    render(<AddressBlock address={full} />);

    expect(lines()).toEqual([
      "Ada Lovelace · Acme",
      "1 Main St",
      "Suite 2",
      "Springfield IL 62701, US",
      "555-0100 · ada@acme.test",
    ]);
  });

  it.each<[string, AddressBlockAddress, string[]]>([
    ["no fields", {}, []],
    ["every field null", empty, []],
    ["every field empty", { name: "", city: "", countryCode: "" }, []],
    ["name only", { name: "Ada Lovelace" }, ["Ada Lovelace"]],
    ["company only", { company: "Acme" }, ["Acme"]],
    ["street1 only", { street1: "1 Main St" }, ["1 Main St"]],
    ["street2 only", { street2: "Suite 2" }, ["Suite 2"]],
    ["city only", { city: "Springfield" }, ["Springfield"]],
    ["state only", { stateProvince: "IL" }, ["IL"]],
    ["postal code only", { postalCode: "62701" }, ["62701"]],
    ["country only", { countryCode: "US" }, ["US"]],
    [
      "city and postal code",
      { city: "Springfield", postalCode: "62701" },
      ["Springfield 62701"],
    ],
    [
      "city and country",
      { city: "Springfield", countryCode: "US" },
      ["Springfield, US"],
    ],
    ["phone only", { phone: "555-0100" }, ["555-0100"]],
    ["email only", { email: "ada@acme.test" }, ["ada@acme.test"]],
  ])("renders only the lines it has: %s", (_, address, expected) => {
    render(<AddressBlock address={address} />);

    expect(lines()).toEqual(expected);
  });

  it("leaves out the name and company when compact", () => {
    render(<AddressBlock address={full} variant="compact" />);

    expect(lines()).toEqual([
      "1 Main St",
      "Suite 2",
      "Springfield IL 62701, US",
      "555-0100 · ada@acme.test",
    ]);
  });

  it("leaves out the phone and email when hideContact is set", () => {
    render(<AddressBlock address={full} hideContact />);

    expect(lines()).toEqual([
      "Ada Lovelace · Acme",
      "1 Main St",
      "Suite 2",
      "Springfield IL 62701, US",
    ]);
  });

  it("shows the label", () => {
    render(<AddressBlock address={full} label="Ship to" />);

    expect(screen.getByText("Ship to")).toBeVisible();
  });
});
