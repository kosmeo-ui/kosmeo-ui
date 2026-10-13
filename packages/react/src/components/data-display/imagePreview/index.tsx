import { PropsWithSize } from "../../types";
import Button from "../../buttons/button";
import "./styles.css";

interface ImagePreviewProps extends PropsWithSize {
  /** An array of URLs for the images to be previewed. */
  previewUrls: string[];
  /** Called when the "Clear" action is pressed. */
  onClear: () => void;
  /** Called when the "Change" action is pressed (typically reopens the picker). */
  onChange: () => void;
}

const ImagePreview = (props: ImagePreviewProps) => {
  const { size = "md" } = props;
  return (
    <div className={`k-image-preview-area`}>
      <div className="k-image-previews-grid">
        {props.previewUrls.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Preview ${index + 1}`}
            className={`k-image-preview-item k-image-preview-item-${size}`}
          />
        ))}
      </div>
      <div className="k-image-preview-actions">
        <Button onClick={props.onChange} variant={"secondary"} size={size}>
          Change Image{props.previewUrls.length > 1 ? "s" : ""}
        </Button>
        <Button size={size} variant="danger" onClick={props.onClear}>
          Clear {props.previewUrls.length > 1 ? "All Images" : "Image"}
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
