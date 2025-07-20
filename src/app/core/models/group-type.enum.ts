export enum GroupType {
  TRIP = 'trip',
  HOUSE = 'house',
  COUPLE = 'couple',
  OTHER = 'other',
}

export const GROUP_TYPE_OPTIONS = [
  { label: 'groupTypes.trip', value: GroupType.TRIP },
  { label: 'groupTypes.house', value: GroupType.HOUSE },
  { label: 'groupTypes.couple', value: GroupType.COUPLE },
  { label: 'groupTypes.other', value: GroupType.OTHER },
];
