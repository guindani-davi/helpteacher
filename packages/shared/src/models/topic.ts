export interface Topic {
  id: string;
  name: string;
  subjectId: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
