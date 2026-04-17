import { Injectable } from '@nestjs/common';
import { IStorageService } from '../../storage/services/i.storage.service';

@Injectable()
export abstract class IReportCacheService {
  protected readonly storageService: IStorageService;

  public constructor(storageService: IStorageService) {
    this.storageService = storageService;
  }

  public abstract getCachedPdf(
    organizationId: string,
    studentId: string,
  ): Promise<Buffer | null>;

  public abstract cachePdf(
    organizationId: string,
    studentId: string,
    pdf: Buffer,
  ): Promise<void>;

  public abstract invalidateCache(
    organizationId: string,
    studentId: string,
  ): Promise<void>;

  public abstract invalidateAllForOrg(organizationId: string): Promise<void>;
}
