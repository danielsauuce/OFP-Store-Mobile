export interface BaseAuthFormProps {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
}

export interface LoginFormProps extends BaseAuthFormProps {
  onSubmit: () => void;
  onForgotPassword: () => void;
}

export interface SignupFormProps extends BaseAuthFormProps {
  name: string;
  setName: (value: string) => void;
  onSubmit: () => void;
}

export interface ResetPasswordFormProps extends BaseAuthFormProps {
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onSubmit: () => void;
  onBackToLogin: () => void;
}
