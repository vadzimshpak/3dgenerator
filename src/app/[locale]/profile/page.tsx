import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions";
import { AssetsSection } from "@/components/AssetsSection";

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("profile");
  const models = await prisma.generatedModel.findMany({
    where: { userId: session.id },
    select: { id: true, name: true, fileUrl: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
    <div className="login-page login-page--compact">
      <div className="login-page__content">
        <div className="login-form">
          <h1 className="login-form__title">{t("title")}</h1>
          <p className="login-form__text">
            <strong>{t("loginLabel")}:</strong> {session.login}
          </p>
          <p className="login-form__text">
            <strong>{t("createdAtLabel")}:</strong>{" "}
            {session.createdAt.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US")}
          </p>
          <form action={logoutAction}>
            <button type="submit" className="login-form__submit">
              {t("logout")}
            </button>
          </form>
          <div className="login-form__link-wrap">
            <Link href="/" className="login-form__link">
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>

    <AssetsSection title={t("assets")} models={models} />
    </>
  );
}
