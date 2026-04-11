export interface ReportOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface ReportStudent {
  id: string;
  name: string;
  surname: string;
}

export interface ReportRegistration {
  id: string;
  schoolName: string;
  gradeLevelName: string;
  educationLevelName: string;
  startDate: string;
  endDate: string | null;
}

export interface ReportClassTopic {
  id: string;
  name: string;
  subjectName: string;
}

export interface ReportClass {
  id: string;
  teacherName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  date: string;
  topics: ReportClassTopic[];
}

export interface StudentReport {
  organization: ReportOrganization;
  student: ReportStudent;
  registration: ReportRegistration | null;
  classes: ReportClass[];
}
