"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import MandatoryAsterisk from "../../forms/requiredAsterisk/index.js";
import IconButton from "../../buttons/iconButton/index.js";
import Tooltip from "../../feedback/tooltip/index.js";
import { useState, useEffect, useId } from "react";
import { Placeholder } from "@tiptap/extensions";
import { PropsWithSize } from "../../types.js";
import StarterKit from "@tiptap/starter-kit";
import "./styles.css";
import {
  faUnderline,
  faTextSlash,
  faItalic,
  faListUl,
  faListOl,
  faBold,
  faCode,
} from "@fortawesome/free-solid-svg-icons";

interface RichTextEditorProps extends PropsWithSize {
  /**
   * **_Optional_** function that is called when the content of the editor changes.
   *
   * Receives the HTML string of the editor content, or undefined if only empty HTML tags.
   */
  onChange?: (html: string | undefined) => void;
  /** **_Optional_** label that appears above the editor */
  label?: string;
  /** **_Optional_** initial HTML value to be set when the editor first loads */
  value?: string;
  /** **_Optional_** placeholder text that appears when the editor is empty */
  placeholder?: string;
  /** **_Optional_** if the editor is disabled (prevents editing) */
  disabled?: boolean;
  /** **_Optional_** whether the editor should be focused when it first loads */
  autofocus?: boolean;
  /** **_Optional_** whether the field is required (shows red asterisk) */
  required?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /** **_Optional_** whether to show character count */
  showCharCount?: boolean;
}

const RichTextEditor = (props: RichTextEditorProps) => {
  const { size = "md", disabled = false, required: _required = false } = props;
  const [showHtml, setShowHtml] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const generatedId = useId();
  const fieldId = props.id || `richtext-${generatedId}`;
  const labelId = `${fieldId}-label`;

  const cleanHtml = (html: string): string | undefined => {
    // Remove trailing empty <p></p> tags
    let cleanedHtml = html.replace(/(<p><\/p>)+$/g, "");
    // Remove trailing empty paragraphs with just whitespace
    cleanedHtml = cleanedHtml.replace(/(<p>\s*<\/p>)+$/g, "");

    // Check if the cleaned HTML has any actual text content
    const temp = document.createElement("div");
    temp.innerHTML = cleanedHtml;
    const textContent = temp.textContent || temp.innerText || "";

    if (textContent.trim().length === 0) {
      return undefined;
    }

    return cleanedHtml;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    content: props.value,
    editorProps: {
      attributes: {
        "aria-multiline": "true",
        ...(props.label
          ? { "aria-labelledby": labelId }
          : { "aria-label": props.placeholder ?? "Rich text editor" }),
      },
    },
    editable: !disabled,
    autofocus: props.autofocus,
    onUpdate: ({ editor }) => {
      if (!isInitialized) {
        return;
      }

      const html = editor.getHTML();
      const cleanedHtml = cleanHtml(html);
      props.onChange?.(cleanedHtml);

      // Update character count based on text content
      const textContent = editor.state.doc.textContent;
      setCharCount(textContent.length);
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isUnderlined: editor.isActive("underline"),
        isBulletedList: editor.isActive("bulletList"),
        isNumberedList: editor.isActive("orderedList"),
      };
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
      // Set initial character count
      const textContent = editor.state.doc.textContent;
      setCharCount(textContent.length);
      setIsInitialized(true);
    }
  }, [disabled, editor]);

  // Sync editor content when value prop changes
  useEffect(() => {
    if (editor) {
      const currentHtml = editor.getHTML();
      const newValue = props.value || "";

      const cleanedCurrent = cleanHtml(currentHtml) || "";
      const cleanedNew = cleanHtml(newValue) || "";

      if (cleanedCurrent !== cleanedNew) {
        // Temporarily mark as not initialized to prevent onChange from firing
        // during external content sync
        setIsInitialized(false);
        editor.commands.setContent(newValue);
        // Re-enable after a short delay to allow content to settle
        setTimeout(() => setIsInitialized(true), 0);
      }

      const textContent = editor.state.doc.textContent;
      setCharCount(textContent.length);
    }
  }, [props.value, editor]);

  return (
    <div className={`k-richtext-container k-richtext-container-${size}`}>
      {props.label && (
        <div className="k-richtext-label-wrapper">
          <label id={labelId} className="k-richtext-label">
            {props.label}
            {props.required && <MandatoryAsterisk />}
          </label>
          {props.showCharCount && (
            <span className="k-richtext-char-count">{charCount}</span>
          )}
        </div>
      )}
      <div
        id={fieldId}
        className={`k-editor-wrapper ${
          disabled ? "k-editor-wrapper-disabled" : ""
        }`}
      >
        <div className="k-editor-toolbar">
          <Tooltip content="Bold" position="top">
            <IconButton
              icon={faBold}
              aria-label="Bold"
              aria-pressed={editorState.isBold}
              size={size}
              variant={editorState.isBold ? "primary" : "secondary"}
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <Tooltip content="Italic" position="top">
            <IconButton
              icon={faItalic}
              aria-label="Italic"
              aria-pressed={editorState.isItalic}
              size={size}
              variant={editorState.isItalic ? "primary" : "secondary"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <Tooltip content="Underline" position="top">
            <IconButton
              icon={faUnderline}
              aria-label="Underline"
              aria-pressed={editorState.isUnderlined}
              size={size}
              variant={editorState.isUnderlined ? "primary" : "secondary"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <div className="k-toolbar-separator"></div>
          <Tooltip content="Bullet List" position="top">
            <IconButton
              icon={faListUl}
              aria-label="Bullet list"
              aria-pressed={editorState.isBulletedList}
              size={size}
              variant={editorState.isBulletedList ? "primary" : "secondary"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <Tooltip content="Numbered List" position="top">
            <IconButton
              icon={faListOl}
              aria-label="Numbered list"
              aria-pressed={editorState.isNumberedList}
              size={size}
              variant={editorState.isNumberedList ? "primary" : "secondary"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <div className="k-toolbar-separator"></div>
          <Tooltip content="Clear Formatting" position="top">
            <IconButton
              icon={faTextSlash}
              aria-label="Clear formatting"
              size={size}
              variant="secondary"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .selectAll()
                  .clearNodes()
                  .unsetAllMarks()
                  .setTextSelection(0)
                  .run();
              }}
              disabled={showHtml || disabled}
            />
          </Tooltip>
          <div className="k-toolbar-separator"></div>
          <Tooltip
            content={showHtml ? "Show Editor" : "Show HTML"}
            position="top"
          >
            <IconButton
              icon={faCode}
              aria-label={showHtml ? "Show editor" : "Show HTML"}
              size={size}
              variant={showHtml ? "primary" : "secondary"}
              onClick={() => setShowHtml(!showHtml)}
              disabled={disabled}
            />
          </Tooltip>
        </div>

        {showHtml && editor ? (
          <pre className="k-html-section">
            {(() => {
              const cleaned = cleanHtml(editor?.getHTML());
              return cleaned
                ? cleaned
                    .replace(/></g, ">\n<")
                    .replace(/^/, "\n")
                    .replace(/\n\s*\n/g, "\n")
                    .trim()
                : "";
            })()}
          </pre>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
