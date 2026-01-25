export const apiPaths = {
  teamsList: "/api/(v1)/teams/list",
  teamsCreate: "/api/(v1)/teams/create",
  teamGet: (teamId: number) => `/api/(v1)/teams/${teamId}/get`,
  teamUpdate: (teamId: number) => `/api/(v1)/teams/${teamId}/update`,
  teamDelete: (teamId: number) => `/api/(v1)/teams/${teamId}/delete`,
  teamRules: (teamId: number) => `/api/(v1)/teams/${teamId}/rules`,
  teamInvitesCreate: (teamId: number) => `/api/(v1)/teams/${teamId}/members/invite`,
  teamInvitesList: (teamId: number) => `/api/(v1)/teams/${teamId}/members/invite/list`,
  teamInvitesResend: (teamId: number) => `/api/(v1)/teams/${teamId}/members/invite/resend`,
  teamInvitesRevoke: (teamId: number) => `/api/(v1)/teams/${teamId}/members/invite/revoke`,
  teamInvitesAccept: (teamId: number) => `/api/(v1)/teams/${teamId}/members/invite/accept`,
  teamProjectsList: (teamId: number) => `/api/(v1)/teams/${teamId}/projects/list`,
  teamProjectsCreate: (teamId: number) => `/api/(v1)/teams/${teamId}/projects/create`,
  teamProjectUpdate: (teamId: number, projectId: number) =>
    `/api/(v1)/teams/${teamId}/projects/${projectId}/update`,
  teamStore: (teamId: number) => `/api/(v1)/teams/${teamId}/store`,
};
