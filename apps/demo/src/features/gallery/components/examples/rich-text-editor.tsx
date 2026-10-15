import { RichTextEditor } from "@kosmeo-ui/react";
import { CodeBlock } from "../code-block";
import { useState } from "react";

export const RichTextEditorExample = () => {
  const [html, setHtml] = useState<string | undefined>(
    "<p>Write something <strong>bold</strong> or <em>italic</em>.</p>"
  );

  return (
    <>
      <RichTextEditor
        label="Release notes"
        value={html}
        onChange={setHtml}
        placeholder="Start writing…"
        showCharCount
      />
      <CodeBlock code={html ?? ""} fileName="onChange output (HTML)" />
    </>
  );
};
