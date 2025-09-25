export interface User {
  readonly id: number;
  readonly email: string;
  readonly name?: string;
}

export interface LoginResponse {
  readonly success: boolean;
  readonly data: {
    readonly user: User;
    readonly token: string;
  };
}
