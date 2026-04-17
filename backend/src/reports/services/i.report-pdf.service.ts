import { Injectable } from '@nestjs/common';
import { StudentReport } from '../models/student-report.model';

@Injectable()
export abstract class IReportPdfService {
  public abstract generateStudentReportPdf(
    report: StudentReport,
  ): Promise<Buffer>;
}
