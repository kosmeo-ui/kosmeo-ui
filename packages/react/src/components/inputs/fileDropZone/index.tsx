"use client";

import { useState } from "react";
import "./styles.css";

export interface FileDropZoneProps {
  /** Callback when files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Callback when there's an error */
  onError?: (error: string) => void;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** File types accepted (e.g., "image/*", ".pdf", "image/png,image/jpeg") */
  accept?: string;
  /** Label text for drag and drop area */
  label?: string;
}

const FileDropZone = ({
  onFilesSelected,
  onError,
  maxFiles = 15,
  accept,
  label = "Drag and drop files here",
}: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFileType = (file: File): boolean => {
    if (!accept) return true;

    const acceptTypes = accept.split(",").map((type) => type.trim());

    return acceptTypes.some((acceptType) => {
      // Handle wildcard (e.g., "image/*")
      if (acceptType.endsWith("/*")) {
        const baseType = acceptType.split("/")[0];
        return file.type.startsWith(baseType + "/");
      }
      // Handle file extension (e.g., ".pdf")
      if (acceptType.startsWith(".")) {
        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
      }
      // Handle specific MIME type (e.g., "image/png")
      return file.type === acceptType;
    });
  };

  const processFiles = (files: FileList) => {
    const fileArray = Array.from(files);

    const validFiles = fileArray.filter(validateFileType);

    if (validFiles.length === 0 && fileArray.length > 0) {
      onError?.("Please upload valid file types only");
      return;
    }

    if (validFiles.length > maxFiles) {
      onError?.(`Too many files selected. Select no more than ${maxFiles}`);
      return;
    }

    onFilesSelected(validFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length !== 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length !== 0) {
      processFiles(files);
    }
  };

  return (
    <div
      className={`k-file-drop-zone ${
        isDragging ? "k-file-drop-zone-dragging" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <p>{label}</p>
      <p>or</p>
      <label htmlFor="file-drop-zone-input" className="k-file-drop-zone-button">
        Browse Files
      </label>
      <input
        type="file"
        accept={accept}
        multiple
        id="file-drop-zone-input"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default FileDropZone;
