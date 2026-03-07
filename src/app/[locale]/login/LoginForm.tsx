"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Link } from "@/i18n/navigation";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const t = useTranslations("login");
  const tAuth = useTranslations("auth");
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form className="login-form" action={formAction}>
      <div className="login-form__field">
        <label className="login-form__label" htmlFor="login-form-login">
          {t("loginLabel")}
        </label>
        <input
          id="login-form-login"
          className="login-form__input"
          type="text"
          name="login"
          autoComplete="username"
          placeholder={t("loginPlaceholder")}
          required
        />
      </div>
      <div className="login-form__field">
        <label className="login-form__label" htmlFor="login-form-password">
          {t("passwordLabel")}
        </label>
        <input
          id="login-form-password"
          className="login-form__input"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          required
        />
      </div>
      {state?.error && (
        <p className="login-form__error" role="alert">
          {tAuth(state.error)}
        </p>
      )}
      <button type="submit" className="login-form__submit">
        {t("submit")}
      </button>
      <div className="login-form__link-wrap">
        <Link href="/register" className="login-form__link">
          {t("createAccount")}
        </Link>
      </div>
    </form>
  );
}
