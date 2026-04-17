import { Injectable } from '@nestjs/common';
import chromium from '@sparticuz/chromium';
import { existsSync } from 'fs';
import puppeteer from 'puppeteer-core';
import { StudentReport } from '../../models/student-report.model';
import {
  type ReportLabels,
  buildStudentReportHtml,
} from '../../templates/student-report.template';
import { IReportPdfService } from '../i.report-pdf.service';

const REPORT_LABELS: ReportLabels = {
  student: 'Aluno',
  registration: 'Matrícula',
  classes: 'Aulas',
  educationLevel: 'Nível de Ensino',
  gradeLevel: 'Série',
  school: 'Escola',
  startDate: 'Data de Início',
  endDate: 'Data de Término',
  date: 'Data',
  day: 'Dia',
  time: 'Horário',
  teacher: 'Professor',
  subjects: 'Disciplinas',
  topics: 'Tópicos',
  noRegistration: 'Nenhuma matrícula encontrada.',
  noClasses: 'Nenhuma aula encontrada.',
  generatedOn: 'Gerado em',
};

const DAY_LABELS: Record<string, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

function translateDay(day: string): string {
  return DAY_LABELS[day.toLowerCase()] ?? day;
}

@Injectable()
export class ReportPdfService extends IReportPdfService {
  public async generateStudentReportPdf(
    report: StudentReport,
  ): Promise<Buffer> {
    // Translate day of week for each class
    const translatedReport: StudentReport = {
      ...report,
      classes: report.classes.map((c) => ({
        ...c,
        dayOfWeek: translateDay(c.dayOfWeek),
      })),
    };
    const html = buildStudentReportHtml(translatedReport, REPORT_LABELS);

    const isServerless =
      !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.VERCEL;

    let executablePath: string | undefined;
    if (isServerless) {
      executablePath = await chromium.executablePath();
    } else if (process.env.CHROME_EXECUTABLE_PATH) {
      executablePath = process.env.CHROME_EXECUTABLE_PATH;
    } else {
      // Try to find Edge on Windows (pre-installed on Windows 10/11)
      const edgePaths = [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      ];
      executablePath = edgePaths.find((p) => existsSync(p));
    }

    if (!executablePath) {
      throw new Error(
        'No browser found. Install Chrome/Edge or set CHROME_EXECUTABLE_PATH.',
      );
    }

    const browser = await puppeteer.launch({
      args: isServerless
        ? chromium.args
        : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
