import {
  CreateInvitePayload,
  CreateProjectPayload,
  CreateTeamPayload,
  CustomRules,
  InviteListResponse,
  InviteResponse,
  ProjectHistoryResponse,
  ProjectListResponse,
  ProjectResponse,
  StoreFilePayload,
  StoreFileResponse,
  StoredFileResponse,
  SuccessResponse,
  TeamListResponse,
  TeamResponse,
  UpdateProjectPayload,
  UpdateTeamPayload,
} from "./types";
import { apiPaths } from "./properties";

/**
 * Performs an asynchronous HTTP request and parses the JSON response.
 *
 * @template T The expected type of the parsed JSON response.
 * @param {string} url The URL to which the request is sent.
 * @param {RequestInit} [init] Optional configuration object containing settings for the request, such as method, headers, and body.
 * @returns {Promise<T>} A promise that resolves to the parsed JSON response as the specified type `T`.
 * @throws {Error} If the response is not ok (non-2xx status code), an error is thrown with the message from the response's `error` field or a default message including the HTTP status code.
 */
const buildHeaders = (headers?: HeadersInit) => {
  const next = new Headers(headers);
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      next.set("Authorization", `Bearer ${token}`);
    }
  }
  return next;
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers),
  });
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    const message = data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
};

/**
 * Sends an HTTP request with the specified method, URL, and optional JSON body.
 *
 * @template T The type of the response data.
 * @param {"POST" | "PUT" | "PATCH" | "DELETE"} method The HTTP method to use for the request.
 * @param {string} url The URL to which the request is sent.
 * @param {Record<string, unknown>} [body] An optional JSON object to be sent as the request body.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON response of type T.
 */
const jsonRequest = async <T>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return requestJson<T>(url, {
    method,
    headers: buildHeaders({ "Content-Type": "application/json" }),
    body: body ? JSON.stringify(body) : undefined,
  });
};

/**
 * Retrieves the list of teams from the specified API endpoint.
 *
 * This function sends an asynchronous request to fetch a list of teams.
 * It uses the `requestJson` utility to handle the API call, which ensures
 * the response adheres to the `TeamListResponse` structure.
 *
 * @function
 * @async
 * @returns {Promise<TeamListResponse>} A promise that resolves to the response containing the list of teams.
 */
export const listTeams = async () => {
  return requestJson<TeamListResponse>(apiPaths.teamsList);
};

/**
 * Asynchronously creates a new team with the specified configuration.
 *
 * @param {CreateTeamPayload} payload - The data required to create the team.
 * @param {string} payload.name - The name of the team to be created.
 * @param {any} payload.customRules - The custom rules or policies to apply to the team.
 * @param {string} payload.defaultRole - The default role to assign to team members.
 * @returns {Promise<TeamResponse>} A promise that resolves to the response containing the details of the created team.
 */
export const createTeam = async (payload: CreateTeamPayload) => {
  const { name, customRules, defaultRole } = payload;
  return jsonRequest<TeamResponse>("POST", apiPaths.teamsCreate, {
    name,
    customRules,
    defaultRole,
  });
};

/**
 * Retrieves team details based on the provided team identifier.
 *
 * @async
 * @function
 * @param {number} teamId - The unique identifier of the team to retrieve.
 * @returns {Promise<TeamResponse>} A promise that resolves to the team's details.
 */
export const getTeam = async (teamId: number) => {
  return requestJson<TeamResponse>(apiPaths.teamGet(teamId));
};

/**
 * Updates the details of a team with the provided payload.
 *
 * @param {UpdateTeamPayload} payload - The payload containing the team update data.
 * @param {string} payload.teamId - The unique identifier of the team to be updated.
 * @param {string} payload.name - The new name for the team.
 * @param {object} payload.customRules - The custom rules to configure the team.
 * @param {string} payload.defaultRole - The default role assigned to new members of the team.
 * @returns {Promise<TeamResponse>} A promise that resolves with the updated team details.
 */
export const updateTeam = async (payload: UpdateTeamPayload) => {
  const { teamId, name, customRules, defaultRole } = payload;
  return jsonRequest<TeamResponse>("PATCH", apiPaths.teamUpdate(teamId), {
    name,
    customRules,
    defaultRole,
  });
};

/**
 * Deletes a team identified by the given team ID.
 * Sends a DELETE request to the specified team delete API endpoint and
 * returns a promise containing the success response.
 *
 * @param {number} teamId - The unique identifier of the team to be deleted.
 * @returns {Promise<SuccessResponse>} A promise that resolves to the success response of the deletion request.
 */
export const deleteTeam = async (teamId: number) => {
  return jsonRequest<SuccessResponse>("DELETE", apiPaths.teamDelete(teamId));
};

/**
 * Updates the custom rules for a specified team by sending a PATCH request to the corresponding API endpoint.
 *
 * @param {number} teamId - The unique identifier of the team whose rules are being updated.
 * @param {CustomRules} customRules - An object containing the new custom rules to be applied to the team.
 * @returns {Promise<TeamResponse>} A promise that resolves with the updated team response.
 */
export const updateTeamRules = async (teamId: number, customRules: CustomRules) => {
  return jsonRequest<TeamResponse>("PATCH", apiPaths.teamRules(teamId), {
    customRules,
  });
};

/**
 * Asynchronously creates a team invite for a specified user.
 *
 * @param {CreateInvitePayload} payload - The payload object containing the required information to create the invite.
 * @param {string} payload.teamId - The unique identifier of the team to which the invite is being sent.
 * @param {string} payload.email - The email address of the user being invited.
 * @param {string} payload.role - The role assigned to the user being invited.
 * @returns {Promise<InviteResponse>} A promise that resolves to the response of the invite creation process.
 */
export const createTeamInvite = async (payload: CreateInvitePayload) => {
  const { teamId, email, role } = payload;
  return jsonRequest<InviteResponse>("POST", apiPaths.teamInvitesCreate(teamId), {
    email,
    role,
  });
};

/**
 * Fetches the list of invites for a specified team.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @returns {Promise<InviteListResponse>} A promise resolving to the list of invites associated with the specified team.
 */
export const listTeamInvites = async (teamId: number) => {
  return requestJson<InviteListResponse>(apiPaths.teamInvitesList(teamId));
};

/**
 * Resends a team invitation to the specified invitee.
 *
 * @param {number} teamId - The unique identifier of the team for which the invitation is being resent.
 * @param {number} inviteId - The unique identifier of the invitation to be resent.
 * @returns {Promise<InviteResponse>} A promise that resolves to the response of the resend operation,
 *                                   which includes the details of the invitation.
 */
export const resendTeamInvite = async (teamId: number, inviteId: number) => {
  return jsonRequest<InviteResponse>("POST", apiPaths.teamInvitesResend(teamId), {
    inviteId,
  });
};

/**
 * Revokes a pending team invite.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @param {number} inviteId - The unique identifier of the invite to revoke.
 * @returns {Promise<SuccessResponse>} A promise that resolves to the response indicating the success of the operation.
 */
export const revokeTeamInvite = async (teamId: number, inviteId: number) => {
  return jsonRequest<SuccessResponse>("POST", apiPaths.teamInvitesRevoke(teamId), {
    inviteId,
  });
};

/**
 * Accepts an invitation to join a team.
 *
 * @param {number} teamId - The unique identifier of the team the invitation belongs to.
 * @param {string} token - The invitation token required to accept the team invite.
 * @returns {Promise<SuccessResponse>} A promise that resolves to the response indicating the success of the operation.
 */
export const acceptTeamInvite = async (teamId: number, token: string) => {
  return jsonRequest<SuccessResponse>("POST", apiPaths.teamInvitesAccept(teamId), {
    token,
  });
};

/**
 * Retrieves the list of projects associated with a specific team.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @returns {Promise<ProjectListResponse>} A promise that resolves to the response containing the list of projects.
 */
export const listTeamProjects = async (teamId: number) => {
  return requestJson<ProjectListResponse>(apiPaths.teamProjectsList(teamId));
};

/**
 * Asynchronously creates a new team project with the specified details.
 *
 * @param {CreateProjectPayload} payload - The payload containing the details for the new project.
 * @param {string} payload.teamId - The unique identifier of the team for which the project is being created.
 * @param {string} payload.name - The name of the new project.
 * @param {string} payload.description - A brief description of the project.
 * @param {string} payload.visibility - The visibility setting for the project (e.g., public or private).
 * @returns {Promise<ProjectResponse>} A promise that resolves to the response of the project creation request.
 */
export const createTeamProject = async (payload: CreateProjectPayload) => {
  const { teamId, name, description, visibility } = payload;
  return jsonRequest<ProjectResponse>("POST", apiPaths.teamProjectsCreate(teamId), {
    name,
    description,
    visibility,
  });
};

/**
 * Updates the details of a specific team project.
 *
 * @param {UpdateProjectPayload} payload - The payload containing the details required to update the project.
 * @param {string} payload.teamId - The unique identifier of the team to which the project belongs.
 * @param {string} payload.projectId - The unique identifier of the project to be updated.
 * @param {string} payload.name - The new name of the project.
 * @param {string} payload.description - The new description of the project.
 * @param {string} payload.visibility - The visibility status of the project (e.g., public or private).
 * @returns {Promise<ProjectResponse>} A promise that resolves to the updated project details.
 */
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

/**
 * Asynchronously stores a file associated with a specific project and team.
 *
 * @param {StoreFilePayload} payload - An object containing the required data to store the file.
 * @param {string} payload.teamId - The unique identifier for the team.
 * @param {string} payload.projectId - The unique identifier for the project.
 * @param {string} payload.filePath - The path where the file will be stored.
 * @param {string} payload.content - The content of the file to be stored.
 * @param {string} [payload.encoding="utf8"] - The encoding format of the file content. Default is "utf8."
 * @param {string} payload.mimeType - The MIME type of the file to be stored.
 * @returns {Promise<StoreFileResponse>} A promise that resolves with the response of the file storage operation.
 */
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

/**
 * Asynchronously stores a project file with a predefined SVG MIME type.
 *
 * This function takes a payload omitting the `mimeType` field and adds it
 * as "image/svg+xml" before delegating the operation to the `storeProjectFile`
 * function. It ensures that the stored file is treated as an SVG resource.
 *
 * @param {Omit<StoreFilePayload, "mimeType">} payload - The payload containing the necessary data for storing the project file, excluding the MIME type.
 * @returns {Promise<any>} A promise that resolves when the storage operation is complete.
 */
export const storeProjectSvg = async (payload: Omit<StoreFilePayload, "mimeType">) => {
  return storeProjectFile({
    ...payload,
    mimeType: "image/svg+xml",
  });
};

/**
 * Asynchronously retrieves the project history for a given team and project.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @param {number} projectId - The unique identifier of the project.
 * @returns {Promise<ProjectHistoryResponse>} A promise that resolves to the project history data.
 */
export const listProjectHistory = async (teamId: number, projectId: number) => {
  const params = new URLSearchParams({
    projectId: String(projectId),
    list: "1",
  });
  return requestJson<ProjectHistoryResponse>(`${apiPaths.teamStore(teamId)}?${params}`);
};

/**
 * Fetches the latest project file for a specified team and project.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @param {number} projectId - The unique identifier of the project.
 * @returns {Promise<StoredFileResponse>} A promise that resolves to the latest stored file response.
 */
export const getLatestProjectFile = async (teamId: number, projectId: number) => {
  const params = new URLSearchParams({ projectId: String(projectId) });
  return requestJson<StoredFileResponse>(`${apiPaths.teamStore(teamId)}?${params}`);
};

/**
 * Retrieves a specific file from a project's storage within a team.
 *
 * @param {number} teamId - The unique identifier of the team.
 * @param {number} projectId - The unique identifier of the project within the team.
 * @param {string} filePath - The relative path of the file within the project's storage.
 * @returns {Promise<StoredFileResponse>} A promise that resolves to the file's stored response.
 */
export const getProjectFile = async (teamId: number, projectId: number, filePath: string) => {
  const params = new URLSearchParams({
    projectId: String(projectId),
    filePath,
  });
  return requestJson<StoredFileResponse>(`${apiPaths.teamStore(teamId)}?${params}`);
};
