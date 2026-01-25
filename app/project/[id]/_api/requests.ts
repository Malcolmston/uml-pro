import {
  CreateInvitePayload,
  CreateProjectPayload,
  CreateTeamPayload,
  CustomRules,
  InviteListResponse,
  InviteResponse,
  ProjectListResponse,
  ProjectResponse,
  StoreFilePayload,
  StoreFileResponse,
  SuccessResponse,
  TeamListResponse,
  TeamResponse,
  UpdateProjectPayload,
  UpdateTeamPayload,
} from "./types";
import { apiPaths } from "./properties";

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
};

const jsonRequest = async <T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return requestJson<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const listTeams = async () => {
  return requestJson<TeamListResponse>(apiPaths.teamsList);
};

export const createTeam = async (payload: CreateTeamPayload) => {
  const { name, customRules, defaultRole } = payload;
  return jsonRequest<TeamResponse>("POST", apiPaths.teamsCreate, {
    name,
    customRules,
    defaultRole,
  });
};

export const getTeam = async (teamId: number) => {
  return requestJson<TeamResponse>(apiPaths.teamGet(teamId));
};

export const updateTeam = async (payload: UpdateTeamPayload) => {
  const { teamId, name, customRules, defaultRole } = payload;
  return jsonRequest<TeamResponse>("PATCH", apiPaths.teamUpdate(teamId), {
    name,
    customRules,
    defaultRole,
  });
};

export const deleteTeam = async (teamId: number) => {
  return jsonRequest<SuccessResponse>("DELETE", apiPaths.teamDelete(teamId));
};

export const updateTeamRules = async (teamId: number, customRules: CustomRules) => {
  return jsonRequest<TeamResponse>("PATCH", apiPaths.teamRules(teamId), {
    customRules,
  });
};

export const createTeamInvite = async (payload: CreateInvitePayload) => {
  const { teamId, email, role } = payload;
  return jsonRequest<InviteResponse>("POST", apiPaths.teamInvitesCreate(teamId), {
    email,
    role,
  });
};

export const listTeamInvites = async (teamId: number) => {
  return requestJson<InviteListResponse>(apiPaths.teamInvitesList(teamId));
};

export const resendTeamInvite = async (teamId: number, inviteId: number) => {
  return jsonRequest<InviteResponse>("POST", apiPaths.teamInvitesResend(teamId), {
    inviteId,
  });
};

export const revokeTeamInvite = async (teamId: number, inviteId: number) => {
  return jsonRequest<SuccessResponse>("POST", apiPaths.teamInvitesRevoke(teamId), {
    inviteId,
  });
};

export const acceptTeamInvite = async (teamId: number, token: string) => {
  return jsonRequest<SuccessResponse>("POST", apiPaths.teamInvitesAccept(teamId), {
    token,
  });
};

export const listTeamProjects = async (teamId: number) => {
  return requestJson<ProjectListResponse>(apiPaths.teamProjectsList(teamId));
};

export const createTeamProject = async (payload: CreateProjectPayload) => {
  const { teamId, name, description, visibility } = payload;
  return jsonRequest<ProjectResponse>("POST", apiPaths.teamProjectsCreate(teamId), {
    name,
    description,
    visibility,
  });
};

export const updateTeamProject = async (payload: UpdateProjectPayload) => {
  const { teamId, projectId, name, description, visibility } = payload;
  return jsonRequest<ProjectResponse>(
    "PUT",
    apiPaths.teamProjectUpdate(teamId, projectId),
    {
      name,
      description,
      visibility,
    }
  );
};

export const storeProjectFile = async (payload: StoreFilePayload) => {
  const { teamId, projectId, filePath, content, encoding = "utf8", mimeType } = payload;
  return jsonRequest<StoreFileResponse>("PUT", apiPaths.teamStore(teamId), {
    projectId,
    filePath,
    content,
    encoding,
    mimeType,
  });
};

export const storeProjectSvg = async (payload: Omit<StoreFilePayload, "mimeType">) => {
  return storeProjectFile({
    ...payload,
    mimeType: "image/svg+xml",
  });
};
