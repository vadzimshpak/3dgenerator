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
        <div
          className="asset-detail__preview"
          style={{
            backgroundImage: `url(/api/queue/${order.id}/image)`,
          }}
        />
        <dl className="asset-detail__meta">
          {order.resultFileUrl && (
            <>
              <dt className="asset-detail__meta-term">{t("downloadModel")}</dt>
              <dd className="asset-detail__meta-desc">
                <a
                  href={order.resultFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="asset-detail__link"
                >
                  {t("downloadModelLink")}
                </a>
              </dd>
            </>
          )}
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
          <dd className="asset-detail__meta-desc">
            {t(`status${order.status}` as "status0" | "status1" | "status2")}
          </dd>
        </dl>
      </div>
    </div>
  );
}
