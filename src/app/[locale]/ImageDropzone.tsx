"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type ImageDropzoneProps = {
  selectImageText: string;
};

export function ImageDropzone({ selectImageText }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

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
      </div>
    </>
  );
}
