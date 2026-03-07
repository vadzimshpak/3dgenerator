import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link, redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function QueueOrderPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
    return null;
  }

  const order = await prisma.generateQueue.findFirst({
    where: { id: Number(id), userId: session.id },
  });

  if (!order) {
    notFound();
  }

  const t = await getTranslations("queue");

  return (
    <div className="asset-detail">
      <div className="asset-detail__content">
        <Link href="/" className="asset-detail__back">
          {t("backToHome")}
        </Link>
        <h1 className="asset-detail__title">{t("title")} #{order.id}</h1>
        <dl className="asset-detail__meta">
          <dt className="asset-detail__meta-term">{t("fileType")}</dt>
          <dd className="asset-detail__meta-desc">{order.fileType}</dd>
          <dt className="asset-detail__meta-term">{t("createdAt")}</dt>
          <dd className="asset-detail__meta-desc">
            {order.createdAt.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </dd>
          <dt className="asset-detail__meta-term">{t("status")}</dt>
          <dd className="asset-detail__meta-desc">{t("statusInQueue")}</dd>
        </dl>
      </div>
    </div>
  );
}
