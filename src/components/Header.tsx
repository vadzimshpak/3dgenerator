import { getTranslations } from "next-intl/server";
import type { SessionUser } from "@/lib/session";
import { Link } from "@/i18n/navigation";
import { HeaderLangSwitcher } from "./HeaderLangSwitcher";

type HeaderProps = {
  session: SessionUser | null;
};

export async function Header({ session }: HeaderProps) {
  const t = await getTranslations("header");

  return (
    <header className="header">
      <Link href="/" className="header__logo">
        {t("logo")}
      </Link>
      <div className="header__right">
        <HeaderLangSwitcher />
        {session ? (
          <Link href="/profile" className="header__login">
            {t("profile")}
          </Link>
        ) : (
          <Link href="/login" className="header__login">
            {t("login")}
          </Link>
        )}
      </div>
    </header>
  );
}
