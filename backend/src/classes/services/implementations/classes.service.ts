import { DayOfWeekEnum } from '@help-teacher/shared';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RolesEnum } from '../../../auth/enums/roles.enum';
import type { JwtPayload } from '../../../auth/models/jwt.model';
import { IClassTopicsService } from '../../../class-topics/services/i.class-topics.service';
import { PaginationQueryDTO } from '../../../common/dtos/pagination-query.dto';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { PaginatedResponse } from '../../../common/models/paginated-response.model';
import { IHelpersService } from '../../../helpers/services/i.helpers.service';
import { ForbiddenOperationException } from '../../../memberships/exceptions/forbidden-operation.exception';
import type { Membership } from '../../../memberships/models/membership.model';
import { IMembershipsService } from '../../../memberships/services/i.memberships.service';
import { IReportCacheService } from '../../../reports/services/i.report-cache.service';
import { ISchedulesService } from '../../../schedules/services/i.schedules.service';
import { IStudentsService } from '../../../students/services/i.students.service';
import { CreateClassBodyDTO } from '../../dtos/create-class.dto';
import { DeleteClassParamsDTO } from '../../dtos/delete-class.dto';
import { GetClassParamsDTO } from '../../dtos/get-class.dto';
import {
  UpdateClassBodyDTO,
  UpdateClassParamsDTO,
} from '../../dtos/update-class.dto';
import { ClassDetail } from '../../models/class-detail.model';
import { Class } from '../../models/class.model';
import { IClassesRepository } from '../../repositories/i.classes.repository';
import { IClassesService } from '../i.classes.service';

/** Maps DayOfWeekEnum to JS Date.getUTCDay() values (0 = Sunday … 6 = Saturday). */
const DAY_OF_WEEK_TO_JS: Record<DayOfWeekEnum, number> = {
  [DayOfWeekEnum.SUNDAY]: 0,
  [DayOfWeekEnum.MONDAY]: 1,
  [DayOfWeekEnum.TUESDAY]: 2,
  [DayOfWeekEnum.WEDNESDAY]: 3,
  [DayOfWeekEnum.THURSDAY]: 4,
  [DayOfWeekEnum.FRIDAY]: 5,
  [DayOfWeekEnum.SATURDAY]: 6,
};

@Injectable()
export class ClassesService extends IClassesService {
  public constructor(
    @Inject(IClassesRepository) classesRepository: IClassesRepository,
    @Inject(IHelpersService) helperService: IHelpersService,
    @Inject(forwardRef(() => ISchedulesService))
    schedulesService: ISchedulesService,
    @Inject(forwardRef(() => IStudentsService))
    studentsService: IStudentsService,
    @Inject(forwardRef(() => IClassTopicsService))
    classTopicsService: IClassTopicsService,
    @Inject(IReportCacheService) reportCacheService: IReportCacheService,
    @Inject(IMembershipsService) membershipsService: IMembershipsService,
  ) {
    super(
      classesRepository,
      helperService,
      schedulesService,
      studentsService,
      classTopicsService,
      reportCacheService,
      membershipsService,
    );
  }

  public async create(
    body: CreateClassBodyDTO,
    membership: Membership,
    user: JwtPayload,
  ): Promise<Class> {
    const organizationId = membership.organizationId;

    const [schedule] = await Promise.all([
      this.schedulesService.getById(body.scheduleId, organizationId),
      this.studentsService.getById(body.studentId, organizationId),
      this.validateTeacher(body.teacherId, organizationId),
    ]);

    this.validateDateMatchesDayOfWeek(body.date, schedule.dayOfWeek);

    const created = await this.classesRepository.create(
      body.scheduleId,
      body.studentId,
      body.teacherId,
      body.date,
      organizationId,
      user.sub,
    );

    await this.reportCacheService.invalidateCache(
      organizationId,
      body.studentId,
    );

    return created;
  }

  public async getById(
    params: GetClassParamsDTO | string,
    membership: Membership | string,
  ): Promise<Class> {
    const classId = typeof params === 'string' ? params : params.classId;
    const organizationId =
      typeof membership === 'string' ? membership : membership.organizationId;

    return this.classesRepository.getById(classId, organizationId);
  }

  public async getDetails(
    params: GetClassParamsDTO,
    membership: Membership,
  ): Promise<ClassDetail> {
    return this.classesRepository.getDetailById(
      params.classId,
      membership.organizationId,
    );
  }

  public async getByStudentId(
    studentId: string,
    membership: Membership,
    pagination: PaginationQueryDTO,
  ): Promise<PaginatedResponse<ClassDetail>> {
    await this.studentsService.getById(studentId, membership.organizationId);

    return this.classesRepository.getByStudentId(
      studentId,
      membership.organizationId,
      pagination,
    );
  }

  public async getByOrganization(
    membership: Membership,
    pagination: PaginationQueryDTO,
  ): Promise<PaginatedResponse<Class>> {
    return this.classesRepository.getByOrganizationId(
      membership.organizationId,
      pagination,
    );
  }

  public async getByOrganizationWithDetails(
    membership: Membership,
    pagination: PaginationQueryDTO,
  ): Promise<PaginatedResponse<ClassDetail>> {
    return this.classesRepository.getByOrganizationIdWithDetails(
      membership.organizationId,
      pagination,
    );
  }

  public async update(
    params: UpdateClassParamsDTO,
    body: UpdateClassBodyDTO,
    membership: Membership,
    user: JwtPayload,
  ): Promise<Class> {
    const organizationId = membership.organizationId;

    const existing = await this.classesRepository.getById(
      params.classId,
      organizationId,
    );

    const validations: Promise<unknown>[] = [];
    let schedulePromise: Promise<unknown> | undefined;
    if (body.scheduleId) {
      schedulePromise = this.schedulesService.getById(
        body.scheduleId,
        organizationId,
      );
      validations.push(schedulePromise);
    }
    if (body.studentId) {
      validations.push(
        this.studentsService.getById(body.studentId, organizationId),
      );
    }
    if (body.teacherId) {
      validations.push(this.validateTeacher(body.teacherId, organizationId));
    }
    await Promise.all(validations);

    // Validate date matches schedule day-of-week when either changes
    const effectiveDate = body.date ?? existing.date;
    const effectiveScheduleId = body.scheduleId ?? existing.scheduleId;
    if (body.date || body.scheduleId) {
      const schedule = schedulePromise
        ? ((await schedulePromise) as Awaited<
            ReturnType<typeof this.schedulesService.getById>
          >)
        : await this.schedulesService.getById(
            effectiveScheduleId,
            organizationId,
          );
      this.validateDateMatchesDayOfWeek(effectiveDate, schedule.dayOfWeek);
    }

    const updated = await this.classesRepository.update(
      params.classId,
      body.scheduleId,
      body.studentId,
      body.teacherId,
      body.date,
      user.sub,
    );

    await this.reportCacheService.invalidateCache(
      organizationId,
      existing.studentId,
    );

    if (body.studentId && body.studentId !== existing.studentId) {
      await this.reportCacheService.invalidateCache(
        organizationId,
        body.studentId,
      );
    }

    return updated;
  }

  public async delete(
    params: DeleteClassParamsDTO,
    membership: Membership,
    user: JwtPayload,
  ): Promise<void> {
    const existing = await this.classesRepository.getById(
      params.classId,
      membership.organizationId,
    );

    await this.classTopicsService.deactivateByClassId(params.classId, user.sub);

    await this.classesRepository.delete(params.classId, user.sub);

    await this.reportCacheService.invalidateCache(
      membership.organizationId,
      existing.studentId,
    );
  }

  private async validateTeacher(
    teacherId: string,
    organizationId: string,
  ): Promise<void> {
    const isTeacher = await this.membershipsService.hasRole(
      teacherId,
      organizationId,
      RolesEnum.TEACHER,
    );

    if (!isTeacher) {
      throw new ForbiddenOperationException(
        'The specified user does not have the teacher role in this organization',
        'errors.teacherNotInOrganization',
      );
    }
  }

  private validateDateMatchesDayOfWeek(
    date: string,
    expectedDay: DayOfWeekEnum,
  ): void {
    const jsDay = new Date(date + 'T00:00:00Z').getUTCDay();
    const expectedJsDay = DAY_OF_WEEK_TO_JS[expectedDay];

    if (jsDay !== expectedJsDay) {
      throw new ValidationException(
        `The date ${date} is not a ${expectedDay}. Please choose a date that falls on a ${expectedDay}.`,
        'errors.dateDayOfWeekMismatch',
        { date, expected: expectedDay },
      );
    }
  }

  public async getActiveIdsByStudentId(studentId: string): Promise<string[]> {
    return this.classesRepository.getActiveIdsByStudentId(studentId);
  }

  public async deactivateByStudentId(
    studentId: string,
    userId: string,
  ): Promise<void> {
    await this.classesRepository.deactivateByStudentId(studentId, userId);
  }

  public async getActiveIdsByScheduleId(scheduleId: string): Promise<string[]> {
    return this.classesRepository.getActiveIdsByScheduleId(scheduleId);
  }

  public async deactivateByScheduleId(
    scheduleId: string,
    userId: string,
  ): Promise<void> {
    await this.classesRepository.deactivateByScheduleId(scheduleId, userId);
  }
}
