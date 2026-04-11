import type { DependencyStatusEnum } from "../enums/dependency-status.enum";
import type { OverallStatusEnum } from "../enums/overall-status.enum";

export interface DependencyStatus {
  name: string;
  status: DependencyStatusEnum;
  latencyMs: number | null;
}

export interface StatusResponse {
  version: string;
  environment: string;
  nodeVersion: string;
  status: OverallStatusEnum;
  dependencies: DependencyStatus[];
}
