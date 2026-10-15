import { GALLERY_CATEGORIES, type GalleryCategory } from "../utils/categories";
import type { ComponentType } from "react";
import { CodeBlock } from "./code-block";
import {
  BorderedSection,
  Col,
  Switch,
  useLocalStorage,
} from "@kosmeo-ui/react";

// Each example is rendered and also imported as raw text, so the code shown is
// exactly the code running above it.
const modules = import.meta.glob<Record<string, ComponentType>>(
  "./examples/*.tsx",
  { eager: true }
);
const sources = import.meta.glob<string>("./examples/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

if (import.meta.env.DEV) {
  const listed = new Set(
    GALLERY_CATEGORIES.flatMap((c) =>
      c.examples.map((e) => `./examples/${e.file}.tsx`)
    )
  );
  for (const path of Object.keys(modules)) {
    if (!listed.has(path)) console.warn(`Gallery example not listed: ${path}`);
  }
}

export const ComponentGallery = ({
  category,
}: {
  category: GalleryCategory;
}) => {
  const [stored, setStored] = useLocalStorage<string[]>(
    "demo-gallery-code-open",
    []
  );
  const open = stored ?? [];

  const toggle = (file: string, show: boolean) =>
    setStored(show ? [...open, file] : open.filter((f) => f !== file));

  return category.examples.map(({ file, title }) => {
    const path = `./examples/${file}.tsx`;
    const [Example] = Object.values(modules[path]);
    const isOpen = open.includes(file);

    return (
      <BorderedSection
        key={file}
        title={title}
        as="h2"
        actions={
          <Switch
            size="sm"
            label="Show code"
            checked={isOpen}
            onChange={(e) => toggle(file, e.target.checked)}
          />
        }
      >
        {/* BorderedSection's stack layout has no gap between children. */}
        <Col size="md">
          <Example />
          {isOpen && (
            <CodeBlock code={sources[path]} fileName={`${file}.tsx`} />
          )}
        </Col>
      </BorderedSection>
    );
  });
};
