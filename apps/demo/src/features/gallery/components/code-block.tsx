import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";
import { IconButton, Tooltip } from "@kosmeo-ui/react";
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  fileName?: string;
}

export const CodeBlock = ({ code, fileName }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="demo-code">
      <div className="demo-code-header">
        <span>{fileName}</span>
        <Tooltip content={copied ? "Copied" : "Copy code"} position="left">
          <IconButton
            icon={copied ? faCheck : faCopy}
            size="sm"
            variant="light"
            aria-label="Copy code"
            onClick={copy}
          />
        </Tooltip>
      </div>
      <pre>
        <code>{code.trimEnd()}</code>
      </pre>
    </div>
  );
};
