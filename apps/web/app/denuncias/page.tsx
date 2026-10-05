import { redirect } from "next/navigation";

/** Rota legada: o canal de denúncias é apresentado em /integridade. */
export default function WhistleblowingRedirectPage() {
  redirect("/integridade");
}
