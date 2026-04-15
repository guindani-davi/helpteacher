export interface Student {
  id: string;
  name: string;
  surname: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface RegistrationDetail {
  id: string;
  startDate: string;
  endDate: string | null;
  school: { id: string; name: string };
  gradeLevel: {
    id: string;
    name: string;
    educationLevel: { id: string; name: string };
  };
}

export interface ClassSummary {
  id: string;
  date: string;
  schedule: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  teacher: { id: string; name: string; surname: string };
  topics: {
    id: string;
    name: string;
    subject: { id: string; name: string };
  }[];
}

export interface StudentDetail {
  student: { id: string; name: string; surname: string };
  currentRegistration: RegistrationDetail | null;
  registrations: RegistrationDetail[];
  classes: ClassSummary[];
  totalClasses: number;
}

export interface StudentUser {
  id: string;
  studentId: string;
  userId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface StudentUserWithUser extends StudentUser {
  user: Pick<import("./user").SafeUser, "id" | "name" | "surname" | "email">;
}
