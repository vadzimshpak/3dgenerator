import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { GenerateForm } from "./GenerateForm";
import { AssetsSection } from "@/components/AssetsSection";

type Props = { params: Promise<{ locale: string }> };

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (session) {
    const activeOrder = await prisma.generateQueue.findFirst({
      where: { userId: session.id, status: { in: [0, 1] } },
      orderBy: { createdAt: "desc" },
    });
    if (activeOrder) {
      redirect({ href: `/queue/${activeOrder.id}`, locale });
      return null;
    }
  }

  const t = await getTranslations("home");
  const [models, usersCount, queueActiveCount, modelsCount] = await Promise.all([
    prisma.generatedModel.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
    prisma.generateQueue.count({ where: { status: { in: [0, 1] } } }),
    prisma.generatedModel.count(),
  ]);

  return (
    <>
      <section className="generator">
        <h1 className="generator__title">{t("title")}</h1>
        <p className="generator__subtitle">{t("subtitle")}</p>
        <GenerateForm
          selectImageText={t("selectImage")}
          generateText={t("generate")}
        />
        <div className="generator-stats">
          <div className="generator-stats__item">
            <span className="generator-stats__value">{usersCount}</span>
            <span className="generator-stats__label">{t("statsUsers")}</span>
          </div>
          <div className="generator-stats__item">
            <span className="generator-stats__value">{queueActiveCount}</span>
            <span className="generator-stats__label">{t("statsQueue")}</span>
          </div>
          <div className="generator-stats__item">
            <span className="generator-stats__value">{modelsCount}</span>
            <span className="generator-stats__label">{t("statsModels")}</span>
          </div>
        </div>
      </section>

      <AssetsSection title={t("assets")} models={models} />
    </>
  );
}
