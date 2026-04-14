import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDTO } from '../../common/dtos/pagination-query.dto';

export class GetTopicsQueryDTO extends PaginationQueryDTO {
  @IsOptional()
  @IsUUID()
  public subjectId?: string;
}
