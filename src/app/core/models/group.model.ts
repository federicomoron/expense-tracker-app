import { GroupType } from '@models/group-type.enum';

export interface Group {
  readonly id: number;
  readonly name: string;
  readonly type: GroupType;
  readonly createdAt: string;
  readonly imageUrl?: string;
}
