import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import "./styles.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "Ricardo Gómez — AI Engineer · AI DevOps · Data Engineer",
    template: "%s | Ricardo Gómez",
  },
  description:
    "AI Engineer y Senior SRE DevOps especializado en AWS, Bedrock y sistemas de agentes. Disponible para trabajo remoto y consultoría.",
  openGraph: {
    type: "website",
    siteName: "Ricardo Gómez",
    images: [{ url: "/linkedin_foto_perfil.jpg" }],
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Nav />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
