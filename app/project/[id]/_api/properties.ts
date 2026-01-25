export const apiPaths = {
  teamsList: "/api/teams/list",
  teamsCreate: "/api/teams/create",
  teamGet: (teamId: number) => `/api/teams/${teamId}/get`,
  teamUpdate: (teamId: number) => `/api/teams/${teamId}/update`,
  teamDelete: (teamId: number) => `/api/teams/${teamId}/delete`,
  teamRules: (teamId: number) => `/api/teams/${teamId}/rules`,
  teamInvitesCreate: (teamId: number) => `/api/teams/${teamId}/members/invite`,
  teamInvitesList: (teamId: number) => `/api/teams/${teamId}/members/invite/list`,
  teamInvitesResend: (teamId: number) => `/api/teams/${teamId}/members/invite/resend`,
  teamInvitesRevoke: (teamId: number) => `/api/teams/${teamId}/members/invite/revoke`,
  teamInvitesAccept: (teamId: number) => `/api/teams/${teamId}/members/invite/accept`,
  teamProjectsList: (teamId: number) => `/api/teams/${teamId}/projects/list`,
  teamProjectsCreate: (teamId: number) => `/api/teams/${teamId}/projects/create`,
  teamProjectUpdate: (teamId: number, projectId: number) =>
    `/api/teams/${teamId}/projects/${projectId}/update`,
  teamStore: (teamId: number) => `/api/teams/${teamId}/store`,
};
