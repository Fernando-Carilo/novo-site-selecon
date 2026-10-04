import type { Metadata } from "next";
import { PlaceholderPage } from "../_placeholder";

export const metadata: Metadata = {
  title: "Canal de denúncias",
  description: "Canal de integridade do Instituto Selecon: relate irregularidades com sigilo.",
};

export default function WhistleblowingPage() {
  return (
    <PlaceholderPage
      title="Canal de denúncias"
      phase="Fase 6"
      currentPath="/denuncias"
      description="O canal segregado e seguro de denúncias (protocolo, código de acesso, anonimato) será implementado na Fase 6, após threat model e testes de abuso."
    />
  );
}
