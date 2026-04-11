export interface School {
  id: string;
  name: string;
  organizationId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
