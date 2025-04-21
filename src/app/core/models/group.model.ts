import { GroupType } from './group-type.enum';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  total: number;
}
