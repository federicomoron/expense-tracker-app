export interface User {
  email: string;
  name: string;
}

export interface RegisterResponse {
  readonly success: boolean;
  readonly data: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
