// Root layout — minimal, locale-specific layout handles the full HTML shell.
// next-intl middleware redirects / → /es automatically.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
