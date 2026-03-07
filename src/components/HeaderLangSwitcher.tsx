"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const LOCALES = [
  { code: "ru" as const, label: "RU" },
  { code: "en" as const, label: "EN" },
];

export function HeaderLangSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();

  return (
    <nav className="header__lang" aria-label="Язык">
      <ul className="header__lang-list">
        {LOCALES.map(({ code, label }) => {
          const isActive = currentLocale === code;
          return (
            <li key={code} className="header__lang-item">
              <Link
                href={pathname}
                locale={code}
                className={`header__lang-btn ${isActive ? "header__lang-btn_active" : ""}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
