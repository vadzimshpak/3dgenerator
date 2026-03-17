"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ImageDropzone } from "./ImageDropzone";

type GenerateFormProps = {
  selectImageText: string;
  generateText: string;
};

export function GenerateForm({ selectImageText, generateText }: GenerateFormProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      if (!file) {
        setError("errorNoFile");
        return;
      }

      const formData = new FormData();
      formData.set("file", file);

      setIsUploading(true);
      setProgress(0);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/queue/create");

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setProgress(null);
        setError("errorUploadFailed");
      };

      xhr.onload = () => {
        setIsUploading(false);
        setProgress(100);

        try {
          const json = JSON.parse(xhr.responseText || "{}") as { id?: number; error?: string };
          if (xhr.status >= 200 && xhr.status < 300 && json.id) {
            router.push(`/${locale}/queue/${json.id}`);
            return;
          }
          setProgress(null);
          setError(json.error || "errorUploadFailed");
        } catch {
          setProgress(null);
          setError("errorUploadFailed");
        }
      };

      xhr.send(formData);
    },
    [file, locale, router]
  );

  const dropzoneProgress = useMemo(() => progress, [progress]);

  return (
    <form
      onSubmit={onSubmit}
      encType="multipart/form-data"
      className="generator__form"
    >
      <ImageDropzone
        selectImageText={selectImageText}
        onFileSelected={setFile}
        isUploading={isUploading}
        uploadProgress={dropzoneProgress}
      />
      {error && (
        <p className="generator__error" role="alert">
          {t(
            error as
              | "errorNoFile"
              | "errorNotImage"
              | "errorFileTooLarge"
              | "errorUploadFailed"
          )}
        </p>
      )}
      <button type="submit" className="generator__btn" disabled={isUploading}>
        {generateText}
      </button>
    </form>
  );
}
