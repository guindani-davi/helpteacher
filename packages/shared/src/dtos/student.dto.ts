export interface CreateStudentBody {
  name: string;
  surname: string;
}

export interface UpdateStudentBody {
  name?: string;
  surname?: string;
}
