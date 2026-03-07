import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AssetDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const model = await prisma.generatedModel.findUnique({
    where: { id: Number(id) },
    include: { user: { select: { login: true } } },
  });

  if (!model) {
    notFound();
  }

  const t = await getTranslations("assetDetail");

  return (
    <div className="asset-detail">
      <div className="asset-detail__content">
        <Link href="/" className="asset-detail__back">
          {t("backToList")}
        </Link>
        <h1 className="asset-detail__title">{model.name}</h1>
        <div
          className="asset-detail__preview"
          style={{ backgroundImage: `url(${model.imageUrl})` }}
        />
        <dl className="asset-detail__meta">
          {model.user && (
            <>
              <dt className="asset-detail__meta-term">{t("author")}</dt>
              <dd className="asset-detail__meta-desc">{model.user.login}</dd>
            </>
          )}
          <dt className="asset-detail__meta-term">{t("createdAt")}</dt>
          <dd className="asset-detail__meta-desc">
            {model.createdAt.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </dd>
          <dt className="asset-detail__meta-term">{t("fileLabel")}</dt>
          <dd className="asset-detail__meta-desc">
            <a
              href={model.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="asset-detail__link"
            >
              {model.fileUrl}
            </a>
          </dd>
        </dl>
      </div>
    </div>
  );
}
