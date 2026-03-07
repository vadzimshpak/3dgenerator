import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "./LoginForm";

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="login-page">
      <div className="login-page__content">
        <LoginForm />
      </div>
    </div>
  );
}
