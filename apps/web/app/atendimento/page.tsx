import type { Metadata } from "next";
import { PlaceholderPage } from "../_placeholder";

export const metadata: Metadata = {
  title: "Central de atendimento",
  description: "Perguntas frequentes, abertura de chamado e acompanhamento por protocolo.",
};

export default function ServicePage() {
  return (
    <PlaceholderPage
      title="Central de atendimento"
      phase="Fase 5"
      currentPath="/atendimento"
      description="O atendimento omnichannel (web, e-mail, WhatsApp) com protocolo e SLA será implementado na Fase 5."
    />
  );
}
