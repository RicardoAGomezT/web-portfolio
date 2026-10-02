// Root page — el middleware de next-intl redirige / → /es automáticamente.
// Este archivo satisface el App Router pero nunca se renderiza.
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/es");
}
