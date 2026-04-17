import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainExceptionCode } from '../enums/domain-exception-code.enum';
import { DomainException } from '../exceptions/domain.exception';
import { ApiErrorResponse } from '../models/api-error.model';

const ERROR_MESSAGES: Record<string, string> = {
  'errors.entityNotFound': '{entity} was not found',
  'errors.entityAlreadyExists': '{entity} already exists',
  'errors.slugAlreadyExists': 'An organization with this name already exists',
  'errors.databaseError': 'An unexpected database error occurred',
  'errors.invalidCredentials': 'Invalid email or password',
  'errors.invalidResetToken': 'Invalid or expired reset token',
  'errors.invalidRefreshToken': 'Invalid or expired refresh token',
  'errors.forbiddenOperation':
    'You do not have permission to perform this action',
  'errors.inviteAlreadyExists':
    'A pending invite already exists for this email in this organization',
  'errors.inviteExpired': 'This invite has expired',
  'errors.authRequired': 'Authentication is required to access this resource',
  'errors.authInvalidToken': 'Authentication token is invalid or expired',
  'errors.notOrgMember': 'You are not a member of this organization',
  'errors.insufficientRole':
    'You do not have the required role to perform this action',
  'errors.validationError': 'One or more validation errors occurred',
  'errors.startTimeBeforeEndTime': 'Start time must be before end time',
  'errors.internalServerError': 'An unexpected error occurred',
  'errors.cannotAssignOwnerRole': 'Cannot assign owner role directly',
  'errors.cannotUpdateOwner':
    'You do not have permission to update this member',
  'errors.cannotUpdateAdmin':
    'You do not have permission to update this member',
  'errors.cannotRemoveOwner':
    'You do not have permission to remove this member',
  'errors.cannotRemoveAdmin':
    'You do not have permission to remove this member',
  'errors.targetAlreadyOwner': 'Target member is already the owner',
  'errors.memberNotInOrganization':
    'Member does not belong to this organization',
  'errors.onlyPendingInvitesRevoked': 'Only pending invites can be revoked',
  'errors.inviteNotPending': 'This invite is no longer pending',
  'errors.inviteEmailMismatch': 'This invite does not belong to your account',
  'errors.inviteAlreadyMember': 'You are already a member of this organization',
  'errors.inviteOrgNotFound':
    'The organization associated with this invite was not found',
  'errors.studentUserNotLinked':
    'Student-user link does not belong to this student',
  'errors.noAccessToStudent': 'You do not have access to this student',
  'errors.teacherNotInOrganization':
    'Teacher is not a member of this organization',
  'errors.registrationOverlap':
    'Student already has a registration that overlaps with the given date range',
};

const ENTITY_NAMES: Record<string, string> = {
  user: 'User',
  organization: 'Organization',
  membership: 'Membership',
  invite: 'Invite',
  student: 'Student',
  school: 'School',
  subject: 'Subject',
  topic: 'Topic',
  class: 'Class',
  schedule: 'Schedule',
  educationLevel: 'Education level',
  gradeLevel: 'Grade level',
  registration: 'Registration',
  studentUser: 'Student-user link',
  classTopic: 'Class-topic link',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: Logger;

  public constructor() {
    this.logger = new Logger(AllExceptionsFilter.name);
  }

  private static readonly DOMAIN_CODE_TO_STATUS = new Map<
    DomainExceptionCode,
    HttpStatus
  >([
    [DomainExceptionCode.ENTITY_NOT_FOUND, HttpStatus.NOT_FOUND],
    [DomainExceptionCode.ENTITY_ALREADY_EXISTS, HttpStatus.CONFLICT],
    [DomainExceptionCode.SLUG_ALREADY_EXISTS, HttpStatus.CONFLICT],
    [DomainExceptionCode.DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR],
    [DomainExceptionCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED],
    [DomainExceptionCode.INVALID_RESET_TOKEN, HttpStatus.UNAUTHORIZED],
    [DomainExceptionCode.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED],
    [DomainExceptionCode.FORBIDDEN_OPERATION, HttpStatus.FORBIDDEN],
    [DomainExceptionCode.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY],
    [DomainExceptionCode.INVITE_ALREADY_EXISTS, HttpStatus.CONFLICT],
    [DomainExceptionCode.INVITE_EXPIRED, HttpStatus.GONE],
    [DomainExceptionCode.REGISTRATION_OVERLAP, HttpStatus.CONFLICT],
  ]);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    const { statusCode, errorResponse } = this.buildErrorResponse(exception);

    this.logException(statusCode, request, exception);

    response.status(statusCode).json(errorResponse);
  }

  private logException(
    statusCode: number,
    request: Request,
    exception: unknown,
  ): void {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const logMessage = `${statusCode} - ${message} | ${request.method} ${request.url}`;

    if (statusCode >= 500) {
      this.logger.error(logMessage);

      if (exception instanceof Error) {
        this.logger.error(exception.stack);
      }
    } else {
      this.logger.warn(logMessage);
    }
  }

  private buildErrorResponse(exception: unknown): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    if (exception instanceof DomainException) {
      return this.handleDomainException(exception);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }

    return this.handleUnknownException();
  }

  private handleDomainException(exception: DomainException): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    const statusCode =
      AllExceptionsFilter.DOMAIN_CODE_TO_STATUS.get(exception.code) ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    const translatedMessage = this.translate(
      exception.messageKey,
      exception.messageArgs,
    );

    return {
      statusCode,
      errorResponse: ApiErrorResponse.create(
        exception.code,
        translatedMessage,
        exception.details,
      ),
    };
  }

  private handleHttpException(exception: HttpException): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (this.isValidationError(exceptionResponse)) {
      const details = (exceptionResponse as { message: string[] }).message;

      return {
        statusCode,
        errorResponse: ApiErrorResponse.create(
          'VALIDATION_ERROR',
          ERROR_MESSAGES['errors.validationError'] ??
            'One or more validation errors occurred',
          details,
        ),
      };
    }

    if (
      typeof exceptionResponse === 'object' &&
      'messageKey' in exceptionResponse
    ) {
      const { messageKey } = exceptionResponse as { messageKey: string };
      const translatedMessage = this.translate(messageKey);
      const errorCode = this.statusToErrorCode(statusCode);

      return {
        statusCode,
        errorResponse: ApiErrorResponse.create(errorCode, translatedMessage),
      };
    }

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : ((exceptionResponse as { message?: string }).message ??
          'An unexpected error occurred');

    const errorCode = this.statusToErrorCode(statusCode);

    return {
      statusCode,
      errorResponse: ApiErrorResponse.create(errorCode, message),
    };
  }

  private handleUnknownException(): {
    statusCode: number;
    errorResponse: ApiErrorResponse;
  } {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorResponse: ApiErrorResponse.create(
        'INTERNAL_SERVER_ERROR',
        ERROR_MESSAGES['errors.internalServerError'] ??
          'An unexpected error occurred',
      ),
    };
  }

  private translate(key: string, args?: Record<string, string>): string {
    let message = ERROR_MESSAGES[key] ?? key;

    if (args) {
      // Translate entity names
      if (args.entity) {
        const entityKey = this.entityNameToKey(args.entity);
        args = { ...args, entity: ENTITY_NAMES[entityKey] ?? args.entity };
      }

      // Replace placeholders
      for (const [argKey, argValue] of Object.entries(args)) {
        message = message.replace(new RegExp(`\\{${argKey}\\}`, 'g'), argValue);
      }
    }

    return message;
  }

  private entityNameToKey(name: string): string {
    return name
      .replace(/-/g, ' ')
      .split(' ')
      .filter((word) => word.toLowerCase() !== 'link')
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
  }

  private isValidationError(response: string | object): boolean {
    return (
      typeof response === 'object' &&
      'message' in response &&
      Array.isArray((response as { message: unknown }).message)
    );
  }

  private statusToErrorCode(status: number): string {
    const statusTextMap = new Map<number, string>([
      [HttpStatus.BAD_REQUEST, 'BAD_REQUEST'],
      [HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
      [HttpStatus.FORBIDDEN, 'FORBIDDEN'],
      [HttpStatus.NOT_FOUND, 'NOT_FOUND'],
      [HttpStatus.CONFLICT, 'CONFLICT'],
      [HttpStatus.UNPROCESSABLE_ENTITY, 'UNPROCESSABLE_ENTITY'],
      [HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS'],
      [HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'],
    ]);

    return statusTextMap.get(status) ?? 'UNKNOWN_ERROR';
  }
}
