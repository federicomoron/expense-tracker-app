export enum GroupType {
  TRIP = 'trip',
  HOUSE = 'house',
  COUPLE = 'couple',
  OTHER = 'other',
}

export const GROUP_TYPE_OPTIONS = [
  { label: 'Trip', value: GroupType.TRIP },
  { label: 'House', value: GroupType.HOUSE },
  { label: 'Couple', value: GroupType.COUPLE },
  { label: 'Other', value: GroupType.OTHER },
];
