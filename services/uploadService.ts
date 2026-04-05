// NOTE: The generic media upload endpoints (/api/media/upload/*) are admin-only on the backend.
// Profile picture upload uses the correct user route via axiosInstance directly — see authService.
// This file only exports the RNFile type used by profile picture upload.

export interface RNFile {
  uri: string;
  name: string;
  type: string;
}
