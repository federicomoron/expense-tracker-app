import { GroupType } from './group-type.enum';
import { Group } from './group.model';

export interface CreateGroupPayload {
  name: string;
  type: GroupType;
  imageUrl?: string;
}

export interface CreateGroupResponse {
  success: boolean;
  data: Group;
}
