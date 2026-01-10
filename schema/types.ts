import { z } from 'zod';

import { loginSchema, signupSchema, resetPasswordSchema } from './forms';

export type LoginFormInput = z.infer<typeof loginSchema>;
export type SignupFormInput = z.infer<typeof signupSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;
