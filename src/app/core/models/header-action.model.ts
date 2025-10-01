export interface HeaderAction {
  label: string;
  icon?: string;
  onClick: () => void;
  color?: string;
  showSpinner?: boolean;
  spinnerColor?: 'primary' | 'white';
}
