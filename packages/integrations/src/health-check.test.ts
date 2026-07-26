import { describe, expect, it } from "vitest";
import { CandidateMockProvider } from "./candidate/candidate-mock-provider.js";
import { EmailMockProvider } from "./email/email-mock-provider.js";
import { MessagingMockProvider } from "./messaging/messaging-mock-provider.js";
import { StorageMockProvider } from "./storage/storage-mock-provider.js";

describe("mock providers", () => {
  it("EmailMockProvider.healthCheck retorna ok", async () => {
    const status = await new EmailMockProvider().healthCheck();
    expect(status.status).toBe("ok");
  });

  it("MessagingMockProvider.healthCheck retorna ok", async () => {
    const status = await new MessagingMockProvider().healthCheck();
    expect(status.status).toBe("ok");
  });

  it("CandidateMockProvider.healthCheck retorna ok", async () => {
    const status = await new CandidateMockProvider().healthCheck();
    expect(status.status).toBe("ok");
  });

  it("StorageMockProvider cria ticket de upload e recupera metadados", async () => {
    const provider = new StorageMockProvider();
    const ticket = await provider.createUploadTicket({
      fileName: "documento.pdf",
      declaredMimeType: "application/pdf",
      sizeBytes: 1024,
      classification: "private",
    });

    const metadata = await provider.getObjectMetadata(ticket.objectKey);
    expect(metadata?.antivirusStatus).toBe("clean");
    expect(metadata?.classification).toBe("private");
  });
});
