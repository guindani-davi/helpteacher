import type { LocaleEnum } from '@help-teacher/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  locale: LocaleEnum;
}
