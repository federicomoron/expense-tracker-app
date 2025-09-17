export enum GroupType {
  TRIP = 'trip',
  HOUSE = 'house',
  COUPLE = 'couple',
  OTHER = 'other',
}

export const GROUP_TYPE_OPTIONS = [
  { value: GroupType.TRIP, label: 'groupType.trip', icon: 'flight' },
  { value: GroupType.HOUSE, label: 'groupType.house', icon: 'home' },
  { value: GroupType.COUPLE, label: 'groupType.couple', icon: 'favorite' },
  { value: GroupType.OTHER, label: 'groupType.other', icon: 'list' },
];
