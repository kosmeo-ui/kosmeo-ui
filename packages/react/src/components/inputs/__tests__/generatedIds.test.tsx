import RichTextEditor from "../richTextEditor/index.js";
import { act, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MultiSelect from "../multiSelect/index.js";
import FileUpload from "../fileUpload/index.js";
import { hydrateRoot } from "react-dom/client";
import TextArea from "../textArea/index.js";
import Checkbox from "../checkbox/index.js";
import Select from "../select/index.js";
import Switch from "../switch/index.js";
import Input from "../input/index.js";
import { ReactElement } from "react";

type Field = [string, () => ReactElement];

const fields: Field[] = [
  ["Input", () => <Input label="Field" />],
  ["TextArea", () => <TextArea label="Field" />],
  ["Select", () => <Select label="Field" options={[]} />],
  [
    "Checkbox",
    () => <Checkbox label="Field" checked={false} onChange={() => {}} />,
  ],
  [
    "Switch",
    () => <Switch label="Field" checked={false} onChange={() => {}} />,
  ],
  [
    "MultiSelect",
    () => <MultiSelect label="Field" options={[]} labelKey="name" />,
  ],
  ["FileUpload", () => <FileUpload label="Field" onFileSelect={() => {}} />],
];

// TipTap's editor is null during a server render, which RichTextEditor doesn't
// handle yet, so it's only checked on the client.
const richText: Field = [
  "RichTextEditor",
  () => <RichTextEditor label="Field" />,
];

const ids = (root: Element) =>
  Array.from(root.querySelectorAll("[id]"), (el) => el.id);

describe.each([...fields, richText])("%s generated id", (_name, element) => {
  it("is stable across re-renders", () => {
    const { container, rerender } = render(element());
    const before = ids(container);
    expect(before.length).toBeGreaterThan(0);

    rerender(element());
    expect(ids(container)).toEqual(before);
  });
});

describe.each(fields)("%s server render", (_name, element) => {
  it("matches between server and client render", async () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(element());
    document.body.append(container);
    const serverIds = ids(container);

    // React 19 reports an attribute mismatch only as a console error, and
    // keeps the server's attribute in the DOM.
    const consoleError = vi.spyOn(console, "error");
    const onRecoverableError = vi.fn();
    await act(async () => {
      hydrateRoot(container, element(), { onRecoverableError });
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(ids(container)).toEqual(serverIds);
    container.remove();
  });
});

it("gives each instance its own id", () => {
  const { container } = render(
    <>
      <Input label="A" />
      <Input label="B" />
    </>
  );
  const [a, b] = ids(container);
  expect(a).not.toBe(b);
});

it("prefers an explicit id", () => {
  const { container } = render(<Input id="email" label="Email" />);
  expect(ids(container)).toEqual(["email"]);
});
