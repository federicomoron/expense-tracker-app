import { GroupType } from '@models/group-type.enum';

export interface Group {
  id: number;
  name: string;
  type: GroupType;
  createdAt: string;
  imageUrl?: string;
}
