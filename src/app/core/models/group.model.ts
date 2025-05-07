import { GroupType } from './group-type.enum';

export interface Group {
  id: number;
  name: string;
  type: GroupType;
  createdAt: string;
}

