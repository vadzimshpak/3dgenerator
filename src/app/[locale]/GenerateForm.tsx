"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { ImageDropzone } from "./ImageDropzone";
import { generateAction, type GenerateState } from "./generateAction";

const initialState: GenerateState = {};

type GenerateFormProps = {
  selectImageText: string;
  generateText: string;
};

export function GenerateForm({ selectImageText, generateText }: GenerateFormProps) {
  const t = useTranslations("home");
  const [state, formAction] = useActionState(generateAction, initialState);

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="generator__form"
    >
      <ImageDropzone selectImageText={selectImageText} />
      {state?.error && (
        <p className="generator__error" role="alert">
          {t(state.error as "errorNoFile" | "errorNotImage" | "errorFileTooLarge")}
        </p>
      )}
      <button type="submit" className="generator__btn">
        {generateText}
      </button>
    </form>
  );
}
