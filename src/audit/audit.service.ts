import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { AuditLog } from "./audit.model";
import { Sequelize } from "sequelize-typescript";

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog) private readonly auditModel: typeof AuditLog,
    private readonly sequelize: Sequelize
  ) {}

  async log(action: string, payload: any, userId?: string, ip?: string) {
    return this.sequelize.transaction(async (tx) => {
      return this.auditModel.create(
        { action, payload, user_id: userId, ip } as any,
        {}
      );
    });
  }
}
