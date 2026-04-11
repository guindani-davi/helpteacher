export interface Registration {
  id: string;
  studentId: string;
  schoolId: string;
  gradeLevelId: string;
  organizationId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
