export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}
