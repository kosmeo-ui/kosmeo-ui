"use client";

import Select from "../select/index.js";

export interface LanguageOption {
  value: string;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "fr-CA", label: "French (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "nl-NL", label: "Dutch (Netherlands)" },
  { value: "sv-SE", label: "Swedish (Sweden)" },
  { value: "da-DK", label: "Danish (Denmark)" },
  { value: "fi-FI", label: "Finnish (Finland)" },
  { value: "no-NO", label: "Norwegian (Norway)" },
  { value: "pl-PL", label: "Polish (Poland)" },
  { value: "ru-RU", label: "Russian (Russia)" },
  { value: "tr-TR", label: "Turkish (Turkey)" },
  { value: "zh-CN", label: "Chinese (Simplified, China)" },
  { value: "zh-TW", label: "Chinese (Traditional, Taiwan)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "ko-KR", label: "Korean (Korea)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { value: "he-IL", label: "Hebrew (Israel)" },
  { value: "hi-IN", label: "Hindi (India)" },
];

interface LanguageSelectProps {
  label?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  /** When true, includes a leading "— None —" option (default true). */
  includeNone?: boolean;
}

const LanguageSelect = ({
  label = "Preferred language",
  value,
  onChange,
  id,
  disabled,
  required,
  includeNone = true,
}: LanguageSelectProps) => {
  // A stored value is shown, never replaced on load (Select would report its
  // first option for a value it lacks): a bare language ("en") as its first
  // locale, any other unknown code as itself.
  const stored = value ?? "";
  const isSupported = SUPPORTED_LANGUAGES.some((l) => l.value === stored);
  const locale =
    stored && !isSupported
      ? SUPPORTED_LANGUAGES.find((l) =>
          l.value.toLowerCase().startsWith(`${stored.toLowerCase()}-`)
        )?.value
      : undefined;
  const unknown: LanguageOption[] =
    stored && !isSupported && !locale ? [{ value: stored, label: stored }] : [];
  const options: LanguageOption[] = [
    ...(includeNone ? [{ value: "", label: "— None —" }] : []),
    ...unknown,
    ...SUPPORTED_LANGUAGES,
  ];

  return (
    <Select
      label={label}
      id={id}
      value={locale ?? stored}
      disabled={disabled}
      required={required}
      options={options}
      onChange={(v) => onChange?.(v ? v : null)}
    />
  );
};

export default LanguageSelect;
