export interface User {
  email: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  data: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
