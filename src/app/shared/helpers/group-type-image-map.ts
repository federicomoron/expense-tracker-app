import { GroupType } from '@models/group-type.enum';

export const GROUP_TYPE_IMAGES: Record<GroupType, string> = {
  [GroupType.TRIP]: '/assets/group-trip.jpg',
  [GroupType.HOUSE]: '/assets/group-house.jpeg',
  [GroupType.COUPLE]: '/assets/group-couple.jpeg',
  [GroupType.OTHER]: '/assets/group-other.jpeg',
};

export function getGroupImage(type: string | undefined, imageUrl?: string): string {
  if (imageUrl) return imageUrl;

  switch (type) {
    case 'trip':
      return '/assets/group-trip.jpg';
    case 'house':
      return '/assets/group-house.jpeg';
    case 'couple':
      return '/assets/group-couple.jpeg';
    default:
      return '/assets/group-other.jpeg';
  }
}
