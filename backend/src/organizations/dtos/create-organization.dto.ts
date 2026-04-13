import type { CreateOrganizationBody } from '@help-teacher/shared';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationBodyDTO implements CreateOrganizationBody {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string;
}
