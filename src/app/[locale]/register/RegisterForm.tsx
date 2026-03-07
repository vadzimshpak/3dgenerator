"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const t = useTranslations("login");
  const tRegister = useTranslations("register");
  const tAuth = useTranslations("auth");
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form className="login-form" action={formAction}>
      <div className="login-form__field">
        <label className="login-form__label" htmlFor="register-form-login">
          {t("loginLabel")}
        </label>
        <input
          id="register-form-login"
          className="login-form__input"
          type="text"
          name="login"
          autoComplete="username"
          placeholder={t("loginPlaceholder")}
          required
        />
      </div>
      <div className="login-form__field">
        <label className="login-form__label" htmlFor="register-form-password">
          {t("passwordLabel")}
        </label>
        <input
          id="register-form-password"
          className="login-form__input"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>
      <div className="login-form__field">
        <label
          className="login-form__label"
          htmlFor="register-form-password-confirm"
        >
          {tRegister("passwordConfirmLabel")}
        </label>
        <input
          id="register-form-password-confirm"
          className="login-form__input"
          type="password"
          name="passwordConfirm"
          autoComplete="new-password"
          placeholder={tRegister("passwordConfirmPlaceholder")}
          required
        />
      </div>
      {state?.error && (
        <p className="login-form__error" role="alert">
          {tAuth(state.error)}
        </p>
      )}
      <button type="submit" className="login-form__submit">
        {tRegister("submit")}
      </button>
      <div className="login-form__link-wrap">
        <Link href="/login" className="login-form__link">
          {tRegister("signIn")}
        </Link>
      </div>
    </form>
  );
}
