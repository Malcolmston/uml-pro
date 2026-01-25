import Visibility from "@/app/db/visibility";
import TeamRole from "@/app/db/teamRole";

export type CustomRules = Record<string, Record<string, boolean | null>>;

export type TeamDTO = {
  id: number | null;
  name: string;
  customRules: CustomRules | null;
  defaultRole: TeamRole;
  role?: TeamRole;
  createdAt: string | null;
  updatedAt: string | null;
};

export type TeamResponse = { team: TeamDTO };

export type TeamListResponse = { teams: TeamDTO[] };

export type InviteDTO = {
  id: number | null;
  email: string;
  role: TeamRole;
  token?: string;
  status?: string;
  createdAt?: string | null;
};

export type InviteResponse = { invite: InviteDTO };

export type InviteListResponse = { invites: InviteDTO[] };

export type SuccessResponse = { success: boolean };

export type ProjectDTO = {
  id: number | null;
  uuid: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  teamId: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProjectResponse = { project: ProjectDTO };

export type ProjectListResponse = { projects: ProjectDTO[] };

export type StoreFilePayload = {
  teamId: number;
  projectId: number;
  filePath: string;
  content: string;
  encoding?: "base64" | "utf8";
  mimeType?: string;
};

export type StoreFileResponse = {
  success: boolean;
  file: {
    path: string;
    size: number;
    mimeType: string | null;
  };
};

export type CreateTeamPayload = {
  name: string;
  customRules?: CustomRules;
  defaultRole?: TeamRole;
};

export type UpdateTeamPayload = {
  teamId: number;
  name?: string;
  customRules?: CustomRules;
  defaultRole?: TeamRole;
};

export type CreateInvitePayload = {
  teamId: number;
  email: string;
  role?: TeamRole;
};

export type CreateProjectPayload = {
  teamId: number;
  name: string;
  description?: string | null;
  visibility?: Visibility;
};

export type UpdateProjectPayload = {
  teamId: number;
  projectId: number;
  name?: string;
  description?: string | null;
  visibility?: Visibility;
};
