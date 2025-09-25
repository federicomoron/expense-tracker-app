import { GroupType } from '@models/group-type.enum';

export const GROUP_TYPE_IMAGES: Readonly<Record<GroupType, string>> = {
  [GroupType.TRIP]: '/assets/group-trip.jpg',
  [GroupType.HOUSE]: '/assets/group-house.jpeg',
  [GroupType.COUPLE]: '/assets/group-couple.jpeg',
  [GroupType.OTHER]: '/assets/group-other.jpeg',
} as const;

export function getGroupImage(type: string | undefined, imageUrl?: string): string {
  if (imageUrl) return imageUrl;

  switch (type) {
    case 'trip':
      return GROUP_TYPE_IMAGES[GroupType.TRIP];
    case 'house':
      return GROUP_TYPE_IMAGES[GroupType.HOUSE];
    case 'couple':
      return GROUP_TYPE_IMAGES[GroupType.COUPLE];
    default:
      return GROUP_TYPE_IMAGES[GroupType.OTHER];
  }
}
