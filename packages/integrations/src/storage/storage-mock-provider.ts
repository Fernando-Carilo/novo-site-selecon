import { randomUUID } from "node:crypto";
import { healthy } from "../health-status.js";
import type {
  StorageProvider,
  StoredObjectMetadata,
  UploadRequest,
  UploadTicket,
} from "./storage-provider.js";

/** Mock em memória — nunca usado em produção. Sem antivírus real; sempre marca "clean". */
export class StorageMockProvider implements StorageProvider {
  private readonly objects = new Map<string, StoredObjectMetadata>();

  async healthCheck() {
    return healthy("StorageMockProvider — sem dependência externa real");
  }

  async createUploadTicket(request: UploadRequest): Promise<UploadTicket> {
    const objectKey = `mock/${request.classification}/${randomUUID()}-${request.fileName}`;
    this.objects.set(objectKey, {
      objectKey,
      checksumSha256: "0".repeat(64),
      sizeBytes: request.sizeBytes,
      mimeType: request.declaredMimeType,
      classification: request.classification,
      antivirusStatus: "clean",
    });
    return {
      uploadUrl: `https://mock-storage.local/upload/${objectKey}`,
      objectKey,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };
  }

  async getObjectMetadata(objectKey: string): Promise<StoredObjectMetadata | null> {
    return this.objects.get(objectKey) ?? null;
  }

  async createDownloadUrl(objectKey: string, expiresInSeconds = 60): Promise<string> {
    return `https://mock-storage.local/download/${objectKey}?expires=${expiresInSeconds}`;
  }
}
