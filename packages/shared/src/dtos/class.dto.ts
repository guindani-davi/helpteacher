export interface CreateClassBody {
  scheduleId: string;
  studentId: string;
  teacherId: string;
  date: string;
}

export interface UpdateClassBody {
  scheduleId?: string;
  studentId?: string;
  teacherId?: string;
  date?: string;
}
