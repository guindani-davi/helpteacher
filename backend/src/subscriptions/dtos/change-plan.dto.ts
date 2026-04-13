import type { ChangePlanBody } from '@help-teacher/shared';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangePlanBodyDTO implements ChangePlanBody {
  @IsUUID()
  @IsNotEmpty()
  public planId: string;
}
