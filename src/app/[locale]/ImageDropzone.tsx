"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type ImageDropzoneProps = {
  selectImageText: string;
  isUploading?: boolean;
  uploadProgress?: number | null;
  onFileSelected?: (file: File | null) => void;
};

export function ImageDropzone({
  selectImageText,
  isUploading = false,
  uploadProgress = null,
  onFileSelected,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      onFileSelected?.(null);
      return;
    }
    onFileSelected?.(file);

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, [onFileSelected]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="image/*"
        className="generator__dropzone-input"
        aria-hidden
        tabIndex={-1}
        onChange={handleChange}
      />
      <div
        className="generator__dropzone"
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {previewUrl ? (
          <span
            className="generator__dropzone-preview"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />
        ) : (
          <span className="generator__dropzone-text">{selectImageText}</span>
        )}

        {isUploading && (
          <div className="generator__dropzone-progress" aria-hidden>
            <div
              className="generator__dropzone-progress-bar"
              style={{ width: `${Math.min(100, Math.max(0, uploadProgress ?? 0))}%` }}
            />
          </div>
        )}
      </div>
    </>
  );
}
