/**
 * Cliente (navegador) do canal de denúncias — passa pelo proxy do portal
 * (/api/central/denuncias/*), que repassa à Selecon Central.
 */
export type DenunciaConfig = {
  categories: { label: string; options: { value: string; label: string }[] }[];
  examStages: string[];
  statusLabels: Record<string, string>;
  attachmentsEnabled: boolean;
  maxAttachments: number;
  maxUploadBytes: number;
  allowedMimeTypes: string[];
  turnstileSiteKey: string | null;
  descriptionMin: number;
  descriptionMax: number;
};
export type DenunciaMessage = { id: string; author: "DENUNCIANTE" | "EQUIPE"; authorName: string | null; body: string; createdAt: string };
export type DenunciaView = { protocol: string; status: string; statusLabel: string; category: string; createdAt: string; updatedAt: string; closed: boolean; messages: DenunciaMessage[] };
export type DenunciaReceipt = { protocol: string; accessCode: string; createdAt: string };

export const EXAM_CATEGORIES = new Set(["FRAUDE_EM_CONCURSO", "IRREGULARIDADE_PROCESSO_SELETIVO"]);
export const RECEIPT_KEY = "selecon.denuncia.comprovante";

export class ApiError extends Error {
  constructor(public status: number, message: string, public issues?: Record<string, string[]>) {
    super(message);
  }
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/central/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? { accept: "application/json" } : { accept: "application/json", "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(35_000),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string; message?: string; details?: { issues?: { fieldErrors?: Record<string, string[]> } }; issues?: { fieldErrors?: Record<string, string[]> } };
  if (!response.ok) {
    const fieldErrors = data.details?.issues?.fieldErrors ?? data.issues?.fieldErrors;
    throw new ApiError(response.status, data.error ?? data.message ?? `Erro ${response.status}`, fieldErrors);
  }
  return data as T;
}

export const getConfig = () => call<DenunciaConfig>("denuncias/config");
export const createDenuncia = (payload: unknown) => call<DenunciaReceipt>("denuncias", payload);
export const consultarDenuncia = (protocol: string, accessCode: string) => call<DenunciaView>("denuncias/consulta", { protocol, accessCode });
export const enviarMensagem = (protocol: string, accessCode: string, body: string) => call<DenunciaMessage>("denuncias/mensagem", { protocol, accessCode, body });
export const presignAnexo = (mimeType: string, size: number, filename: string) => call<{ uploadUrl: string; key: string }>("denuncias/anexos/presign", { mimeType, size, filename });

export const formatDateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
