export interface CreateTopicBody {
  name: string;
  subjectId: string;
}

export interface UpdateTopicBody {
  name?: string;
  subjectId?: string;
}
