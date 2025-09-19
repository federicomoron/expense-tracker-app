import { GroupType } from '@models/group-type.enum';
import { Group } from '@models/group.model';

export interface CreateGroupPayload {
  name: string;
  type: GroupType;
  imageUrl?: string;
}

export interface CreateGroupResponse {
  success: boolean;
  data: Group;
}
