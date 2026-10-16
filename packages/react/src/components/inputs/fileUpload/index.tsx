"use client";

import MandatoryAsterisk from "../../forms/requiredAsterisk/index.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithSize, PropsWithVariant } from "../../types.js";
import IconButton from "../../buttons/iconButton/index.js";
import { useEffect, useId, useRef, useState } from "react";
import Button from "../../buttons/button/index.js";
import Modal from "../../overlays/modal/index.js";
import "./styles.css";
import {
  faUpload,
  faFile,
  faTrash,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps extends PropsWithSize, PropsWithVariant {
  /** A callback function that receives the selected files. */
  onFileSelect: (files: File[] | null) => void;
  /**
   * **_Optional_** flag to allow multiple file selection
   *
   * Defaults to false
   */
  multiple?: boolean;
  /**
   * **_Optional_** Accepted file types
   *
   * Example: "image/*", ".pdf", ".doc,.docx"
   */
  accept?: string;
  /**
   * **_Optional_** Position of the file list relative to the upload button
   *
   * Accepts "above" or "below"
   *
   * Defaults to "below"
   */
  fileListPosition?: "above" | "below";
  /** **_Optional_** Maximum file size in bytes */
  maxSize?: number;
  /** **_Optional_** Label to display above the component */
  label?: string;
  /** **_Optional_** whether the field is required (shows red asterisk and enables validation) */
  required?: boolean;
  /** **_Optional_** ID of the field. If one is not provided, it will be randomly generated */
  id?: string;
  /**
   * **_Optional_** When true, renders a second "Upload Folder" button next to
   * "Upload Files" in the empty state. Directory picks preserve the relative
   * path in each `File`'s `webkitRelativePath` so callers can reconstruct the
   * source tree when composing object keys.
   */
  allowDirectory?: boolean;
  /**
   * **_Optional_** Files to seed the component with on mount. `onFileSelect`
   * is fired once synchronously so the parent's state stays in sync. Use a
   * `key` on the parent if you need to re-seed across remounts.
   */
  initialFiles?: File[];
  /**
   * **_Optional_** Custom render function for the file list
   *
   * Receives the selected files, remove handler, clear handler, and change handler
   */
  renderFiles?: (params: {
    files: File[];
    onRemove: (index: number) => void;
    onClear: () => void;
    onChange: () => void;
  }) => React.ReactNode;
}

const FileUpload = (props: FileUploadProps) => {
  const {
    multiple = false,
    variant = "primary",
    size = "md",
    fileListPosition = "below",
    required = false,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>(
    () => props.initialFiles ?? []
  );
  // Sync the parent once on mount when seeded — parent state tracks this
  // component's selection, so without the notification it would miss the seed.
  const onFileSelectRef = useRef(props.onFileSelect);
  onFileSelectRef.current = props.onFileSelect;
  useEffect(() => {
    if (props.initialFiles && props.initialFiles.length > 0) {
      onFileSelectRef.current(props.initialFiles);
    }
  }, []);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [oversizedFileInfo, setOversizedFileInfo] = useState<{
    files: string[];
    maxSize: string;
  }>({ files: [], maxSize: "" });

  const generatedId = useId();
  const componentId = props.id || `fileupload-${generatedId}`;
  const directoryId = `${componentId}-dir`;

  // `webkitdirectory` isn't in React's DOM type map; set it imperatively.
  useEffect(() => {
    if (props.allowDirectory && directoryInputRef.current) {
      directoryInputRef.current.setAttribute("webkitdirectory", "");
      directoryInputRef.current.setAttribute("directory", "");
    }
  }, [props.allowDirectory]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.min(
      Math.floor(Math.log(bytes) / Math.log(k)),
      sizes.length - 1
    );
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const { maxSize } = props;
      const newFilesArray = Array.from(files);

      if (maxSize) {
        const oversizedFiles = newFilesArray.filter((f) => f.size > maxSize);
        if (oversizedFiles.length > 0) {
          const maxSizeFormatted = formatFileSize(maxSize);
          const fileNames = oversizedFiles.map((f) => f.name);
          setOversizedFileInfo({ files: fileNames, maxSize: maxSizeFormatted });
          setShowSizeModal(true);
          return;
        }
      }

      setSelectedFiles(newFilesArray);
      props.onFileSelect(newFilesArray);
    } else {
      setSelectedFiles([]);
      props.onFileSelect(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    props.onFileSelect(newFiles.length > 0 ? newFiles : null);

    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    props.onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileList =
    selectedFiles.length > 0 &&
    (props.renderFiles ? (
      props.renderFiles({
        files: selectedFiles,
        onRemove: handleRemoveFile,
        onClear: handleClearFiles,
        onChange: () => fileInputRef.current?.click(),
      })
    ) : (
      <div className="k-file-list">
        <div className="k-file-list-header">
          <span>Selected Files ({selectedFiles.length})</span>
          <div className="k-file-list-actions">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant={variant}
              size={size}
            >
              Change File{selectedFiles.length > 1 ? "s" : ""}
            </Button>
            <Button onClick={handleClearFiles} variant="danger" size={size}>
              Clear All
            </Button>
          </div>
        </div>
        <ul className="k-file-list-items">
          {selectedFiles.map((file, index) => (
            <li key={index} className="k-file-list-item">
              <div className="k-file-info">
                <FontAwesomeIcon icon={faFile} className="k-file-icon" />
                <span className="k-file-name">{file.name}</span>
                <span className="k-file-size">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <IconButton
                icon={faTrash}
                onClick={() => handleRemoveFile(index)}
                aria-label={`Remove ${file.name}`}
                variant="danger"
                size={size}
              />
            </li>
          ))}
        </ul>
      </div>
    ));

  return (
    <div className={"k-file-upload-container"}>
      {props.label && (
        <label htmlFor={componentId} className="k-file-upload-label-text">
          {props.label}
          {required && <MandatoryAsterisk />}
        </label>
      )}
      <input
        type="file"
        accept={props.accept}
        multiple={multiple}
        onChange={handleFileChange}
        ref={fileInputRef}
        className="k-file-upload-input"
        id={componentId}
        required={required}
      />
      {props.allowDirectory && (
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          ref={directoryInputRef}
          className="k-file-upload-input"
          id={directoryId}
        />
      )}

      {fileListPosition === "above" && fileList}

      {selectedFiles.length === 0 && (
        <div className="k-file-upload-empty-actions">
          <label
            htmlFor={componentId}
            className={`k-button k-button-${variant} k-button-${size} k-button-center k-file-upload-button`}
          >
            <FontAwesomeIcon icon={faUpload} /> Upload{" "}
            {multiple ? "Files" : "File"}
          </label>
          {props.allowDirectory && (
            <label
              htmlFor={directoryId}
              className={`k-button k-button-${variant} k-button-${size} k-button-center k-file-upload-button`}
            >
              <FontAwesomeIcon icon={faFolderOpen} /> Upload Folder
            </label>
          )}
        </div>
      )}

      {fileListPosition === "below" && fileList}

      <Modal
        show={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        title="File Size Error"
      >
        <div>
          <p>
            <strong>The following file(s) are too large:</strong>
          </p>
          <ul>
            {oversizedFileInfo.files.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
          <p>
            Maximum allowed file size is{" "}
            <strong>{oversizedFileInfo.maxSize}</strong>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FileUpload;
