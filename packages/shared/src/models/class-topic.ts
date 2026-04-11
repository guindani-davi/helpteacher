export interface ClassTopic {
  id: string;
  classId: string;
  topicId: string;
  isActive: boolean;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ClassTopicDetail {
  classTopicId: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
}
