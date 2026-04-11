import type { LocaleEnum } from "../enums/locale.enum";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  hasUsedTrial: boolean;
  locale: LocaleEnum;
  createdAt: string;
  updatedAt: string | null;
}
