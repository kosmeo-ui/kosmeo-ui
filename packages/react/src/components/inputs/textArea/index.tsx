import FieldShell from "../../forms/fieldShell";
import { PropsWithSize } from "../../types";
import { useEffect, useRef } from "react";
import "./styles.css";

interface TextAreaProps extends PropsWithSize {
  /** **_Optional_** if the field is disabled */
  disabled?: boolean;
  /** **_Optional_** label that appears above the input */
  label?: string | React.ReactNode;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** placeholder text that will appear in the input until the user adds a value */
  placeholder?: string;
  /** **_Optional_** value to be set when the element first loads */
  value?: string;
  /** **_Optional_** the number of rows */
  rows?: number;
  /** **_Optional_** the number of colomuns */
  cols?: number;
  /** **_Optional_** maximum value for the input */
  ref?: React.Ref<HTMLTextAreaElement>;
  /** **_Optional_** maximum value for the input */
  max?: number;
  /** **_Optional_** minimum value for the input */
  min?: number;
  /** **_Optional_** whether to show character count next to label */
  showCharCount?: boolean;
  /** **_Optional_** function that is called when the value of the input changes */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /** **_Optional_** function that is called when the input is focused */
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** **_Optional_** function that is called when the input loses focus */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  /** **_Optional_** function that is called when the user presses a key down in the input */
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  /** **_Optional_** whether to auto-expand the textarea as user types */
  autoExpand?: boolean;
  /** **_Optional_** maximum number of rows when auto-expanding */
  maxRows?: number;
}

const TextArea = (props: TextAreaProps) => {
  const {
    size = "md",
    disabled = false,
    required = false,
    autoExpand = false,
    maxRows = 5,
    rows = 3,
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const internalRef = props.ref || textareaRef;

  const inputId =
    props.id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const adjustHeight = () => {
    if (!autoExpand) return;
    const ref = typeof internalRef === "object" && internalRef?.current;
    if (!ref) return;

    ref.style.height = "auto";

    const style = window.getComputedStyle(ref);
    const lHeight = parseInt(style.lineHeight);
    const pTop = parseInt(style.paddingTop);
    const pBottom = parseInt(style.paddingBottom);
    const bTop = parseInt(style.borderTopWidth);
    const bBottom = parseInt(style.borderBottomWidth);

    const minHeight = lHeight * rows + pTop + pBottom + bTop + bBottom;
    const maxHeight = lHeight * maxRows + pTop + pBottom + bTop + bBottom;

    if (!ref.value.trim()) {
      ref.style.height = `${minHeight}px`;
      ref.style.overflowY = "hidden";
      return;
    }

    const newHeight = Math.min(ref.scrollHeight, maxHeight);
    ref.style.height = `${Math.max(newHeight, minHeight)}px`;
    ref.style.overflowY = ref.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    adjustHeight();
  }, [props.value, autoExpand, maxRows, rows]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.onChange) props.onChange(e);
    adjustHeight();
  };

  const charCount = props.showCharCount ? (
    <>
      {props.value?.length || 0}
      {props.max && ` / ${props.max}`}
    </>
  ) : undefined;

  return (
    <FieldShell
      label={props.label}
      required={required}
      htmlFor={inputId}
      labelAside={charCount}
    >
      <textarea
        id={inputId}
        className={`k-textarea k-textarea-${size} ${
          autoExpand ? "k-textarea-auto-expand" : ""
        }`}
        placeholder={props.placeholder}
        rows={rows}
        cols={props.cols}
        value={props.value}
        ref={internalRef}
        required={required}
        maxLength={props.max}
        minLength={props.min}
        disabled={disabled}
        onChange={handleChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
    </FieldShell>
  );
};

export default TextArea;
