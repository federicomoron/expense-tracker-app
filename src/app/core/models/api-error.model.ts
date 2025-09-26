export interface ValidationErrorDetail {
  property: string;
  messages: string[];
}

export interface BackendError {
  type: string;
  message: string;
  details?: { errors: ValidationErrorDetail[] };
}
