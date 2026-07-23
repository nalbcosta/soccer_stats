import type { AuditLog } from "@soccer-stats/shared";
import type { Repositories } from "../../types.js";
import { createId } from "../../lib/ids.js";

export class AuditService {
  constructor(private readonly repositories: Repositories) {}

  async record(input: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> {
    return this.repositories.auditLogs.create({
      id: createId(),
      ...input,
      createdAt: new Date().toISOString()
    });
  }
}
