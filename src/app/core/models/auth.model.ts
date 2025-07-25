export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
