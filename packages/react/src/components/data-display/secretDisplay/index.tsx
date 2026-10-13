"use client";

import IconButton from "../../buttons/iconButton/index.js";
import { ReactNode, useState } from "react";
import "./styles.css";
import {
  faCheck,
  faCopy,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

export interface SecretDisplayProps {
  /** The secret value to display. */
  value: string;
  /** Show a copy-to-clipboard button. Defaults to true. */
  copyable?: boolean;
  /** Show a reveal/hide toggle. Defaults to false. When true the value is masked initially. */
  revealable?: boolean;
  /** Optional element rendered before the value (icon, prefix). */
  leading?: ReactNode;
  /** When revealable, character used for masking. Defaults to "•". */
  maskChar?: string;
  /** Visible character count when masked. Defaults to 12. */
  maskLength?: number;
}

const SecretDisplay = ({
  value,
  copyable = true,
  revealable = false,
  leading,
  maskChar = "•",
  maskLength = 12,
}: SecretDisplayProps) => {
  const [revealed, setRevealed] = useState(!revealable);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const display = revealed ? value : maskChar.repeat(maskLength);

  return (
    <div className="k-secret-display">
      {leading && <div className="k-secret-display-leading">{leading}</div>}
      <code className="k-secret-display-value k-mono">{display}</code>
      {revealable && (
        <IconButton
          icon={revealed ? faEyeSlash : faEye}
          onClick={() => setRevealed((r) => !r)}
          variant="secondary"
          size="sm"
          fullWidth={false}
          aria-label={revealed ? "Hide" : "Reveal"}
        />
      )}
      {copyable && (
        <IconButton
          icon={copied ? faCheck : faCopy}
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          fullWidth={false}
          aria-label="Copy"
        />
      )}
    </div>
  );
};

export default SecretDisplay;
