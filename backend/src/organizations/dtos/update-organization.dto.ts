import type { UpdateOrganizationBody } from '@help-teacher/shared';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationBySlugParamsDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  public slug: string;
}

export class UpdateOrganizationBySlugBodyDTO implements UpdateOrganizationBody {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(255)
  public name?: string;
}
