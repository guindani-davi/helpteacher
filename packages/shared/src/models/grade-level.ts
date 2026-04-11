export interface GradeLevel {
  id: string;
  name: string;
  educationLevelId: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
