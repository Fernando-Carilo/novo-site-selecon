import type { HealthStatus } from "@selecon/contracts";

export type FileClassification = "public" | "private" | "restricted";

export interface UploadRequest {
  fileName: string;
  declaredMimeType: string;
  sizeBytes: number;
  classification: FileClassification;
}

export interface UploadTicket {
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface StoredObjectMetadata {
  objectKey: string;
  checksumSha256: string;
  sizeBytes: number;
  mimeType: string;
  classification: FileClassification;
  antivirusStatus: "pending" | "clean" | "infected";
}

/**
 * Abstração de armazenamento (S3-compatible) com fluxo de upload assinado + quarentena +
 * antivírus, conforme seção 11.5. Nenhuma implementação real (S3 + scanner) existe ainda —
 * ver docs/INTEGRATIONS.md, item 4.
 */
export interface StorageProvider {
  healthCheck(): Promise<HealthStatus>;
  createUploadTicket(request: UploadRequest): Promise<UploadTicket>;
  getObjectMetadata(objectKey: string): Promise<StoredObjectMetadata | null>;
  createDownloadUrl(objectKey: string, expiresInSeconds?: number): Promise<string>;
}
