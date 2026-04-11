export interface CreateRegistrationBody {
  studentId: string;
  schoolId: string;
  gradeLevelId: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateRegistrationBody {
  studentId?: string;
  schoolId?: string;
  gradeLevelId?: string;
  startDate?: string;
  endDate?: string | null;
}
