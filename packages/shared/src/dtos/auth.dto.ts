export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface RequestPasswordResetBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}
