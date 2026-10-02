import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Ricardo Gómez
        </h1>
        <p className="text-xl text-muted-foreground font-mono">
          {t("headline")}
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t("subheadline")}
        </p>
        <div className="flex gap-4 pt-4">
          <a
            href="/cv/richie-gomez-cv-es.pdf"
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md font-medium hover:opacity-80 transition-opacity"
          >
            {t("cta_cv")}
          </a>
          <a
            href="/contacto"
            className="px-4 py-2 border border-black dark:border-white rounded-md font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t("cta_contact")}
          </a>
        </div>
      </div>
    </main>
  );
}
