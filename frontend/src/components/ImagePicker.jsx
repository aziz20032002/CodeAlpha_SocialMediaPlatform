import { useEffect, useId, useRef, useState } from "react";
import SocialIcon from "./SocialIcon";

function ImagePicker({ disabled, file, label = "Add photo", onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="image-picker">
      <input
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="image-picker-input"
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.target.files[0] || null)}
        ref={inputRef}
        type="file"
      />
      {!file ? (
        <label className="image-picker-trigger" htmlFor={inputId}>
          <SocialIcon name="image" />
          {label}
        </label>
      ) : (
        <div className="image-picker-preview">
          <img alt="Selected post preview" src={preview} />
          <div className="image-picker-caption">
            <strong>{file.name}</strong>
            <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
          </div>
          <button
            aria-label="Remove selected photo"
            className="image-picker-remove"
            disabled={disabled}
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onChange(null);
            }}
            type="button"
          >
            <SocialIcon name="close" />
            <span>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ImagePicker;
