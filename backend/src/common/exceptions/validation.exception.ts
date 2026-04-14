import { DomainExceptionCode } from '../enums/domain-exception-code.enum';
import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  public constructor(
    message: string,
    messageKey = 'errors.validationError',
    messageArgs?: Record<string, string>,
  ) {
    super(
      message,
      DomainExceptionCode.VALIDATION_ERROR,
      messageKey,
      messageArgs,
    );
  }
}
