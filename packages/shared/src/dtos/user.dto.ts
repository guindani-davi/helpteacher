import type { LocaleEnum } from "../enums/locale.enum";

export interface CreateUserBody {
  email: string;
  password: string;
  name: string;
  surname: string;
  locale?: LocaleEnum;
}

export interface UpdateUserBody {
  locale?: LocaleEnum;
  password?: string;
  currentPassword?: string;
}
