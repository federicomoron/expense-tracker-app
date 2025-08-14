import { GroupType } from '@models/group-type.enum';

export const GROUP_TYPE_IMAGES: Record<GroupType, string> = {
  [GroupType.TRIP]: '/assets/trip.jpg',
  [GroupType.HOME]: '/assets/home.jpeg',
  [GroupType.COUPLE]: '/assets/couple.jpeg',
  [GroupType.OTHER]: '/assets/other.jpeg',
};

export function getGroupImage(type: string | undefined, imageUrl?: string): string {
  if (imageUrl) return imageUrl;

  switch (type) {
    case 'trip':
      return '/assets/trip.jpg';
    case 'home':
      return '/assets/home.jpeg';
    case 'couple':
      return '/assets/couple.jpeg';
    default:
      return '/assets/other.jpeg';
  }
}
