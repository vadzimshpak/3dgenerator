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
  const models = await prisma.generatedModel.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <section className="generator">
        <h1 className="generator__title">{t("title")}</h1>
        <p className="generator__subtitle">{t("subtitle")}</p>
        <GenerateForm
          selectImageText={t("selectImage")}
          generateText={t("generate")}
        />
      </section>

      <AssetsSection title={t("assets")} models={models} />
    </>
  );
}
