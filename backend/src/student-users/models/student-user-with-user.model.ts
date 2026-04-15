import { StudentUser } from './student-user.model';

export class StudentUserWithUser extends StudentUser {
  public readonly user: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };

  public constructor(
    base: StudentUser,
    user: { id: string; name: string; surname: string; email: string },
  ) {
    super(
      base.id,
      base.studentId,
      base.userId,
      base.isActive,
      base.createdBy,
      base.updatedBy,
      base.createdAt,
      base.updatedAt,
    );
    this.user = user;
  }
}
