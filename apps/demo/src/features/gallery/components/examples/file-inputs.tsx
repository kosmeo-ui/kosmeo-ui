import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FileDropZone,
  FileUpload,
  FormGrid,
  ImagePreview,
} from "@kosmeo-ui/react";

export const FileInputs = () => {
  const [images, setImages] = useState<File[] | null>(null);

  const previewUrls = useMemo(
    () => (images ?? []).map((f) => URL.createObjectURL(f)),
    [images]
  );
  useEffect(
    () => () => previewUrls.forEach(URL.revokeObjectURL),
    [previewUrls]
  );

  return (
    <FormGrid columns={2}>
      <FileUpload
        label="FileUpload"
        multiple
        maxSize={5 * 1024 * 1024}
        onFileSelect={(files) =>
          files && toast.info(`Selected ${files.length} file(s)`)
        }
      />
      <FileUpload
        label="FileUpload + ImagePreview"
        accept="image/*"
        multiple
        onFileSelect={setImages}
        renderFiles={({ onClear, onChange }) => (
          <ImagePreview
            previewUrls={previewUrls}
            onClear={onClear}
            onChange={onChange}
          />
        )}
      />
      <FileDropZone
        label="FileDropZone: drop up to 3 files"
        maxFiles={3}
        onFilesSelected={(files) =>
          toast.success(`Dropped ${files.map((f) => f.name).join(", ")}`)
        }
        onError={(message) => toast.error(message)}
      />
    </FormGrid>
  );
};
