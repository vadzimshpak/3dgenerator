import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const models = await prisma.generatedModel.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="generator">
        <h1 className="generator__title">{t("title")}</h1>
        <p className="generator__subtitle">{t("subtitle")}</p>
        <div className="generator__dropzone" role="button" tabIndex={0}>
          <span className="generator__dropzone-text">{t("selectImage")}</span>
        </div>
        <button type="button" className="generator__btn">
          {t("generate")}
        </button>
      </section>

      <section className="assets">
        <h2 className="assets__title">{t("assets")}</h2>
        <div className="assets__grid">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/assets/${model.id}`}
              className="asset-card"
            >
              <span
                className="asset-card__image"
                style={{ backgroundImage: `url(${model.imageUrl})` }}
              />
              <span className="asset-card__name">{model.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
