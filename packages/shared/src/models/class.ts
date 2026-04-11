export interface Class {
  id: string;
  scheduleId: string;
  studentId: string;
  teacherId: string;
  date: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ClassDetail {
  classInfo: { id: string; date: string };
  student: { id: string; name: string; surname: string };
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
