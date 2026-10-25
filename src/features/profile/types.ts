export interface UserProfileData {
  id: string;
  email: string;
  displayName: string;
  targetScore: number;
  role: "student" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  error?: string;
  profile?: UserProfileData;
}

export interface ExportDataResult {
  success: boolean;
  jsonData?: string;
  filename?: string;
  error?: string;
}
