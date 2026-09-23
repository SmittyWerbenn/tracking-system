export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  MINIO_ENDPOINT: string;
  MINIO_BUCKET: string;
  MINIO_ACCESS_KEY: string;
  MINIO_SECRET_KEY: string;
  SESSION_TTL_HOURS: string;
}

export type Role = "Superadmin" | "Admin" | "Driver" | "Viewer";

export interface AuthedUser {
  id: string;
  nama: string;
  email: string;
  role: Role;
  aktif: number;
}

export interface Ctx {
  env: Env;
  request: Request;
  user: AuthedUser | null;
  requestId: string;
}
