type SendEmailParams = {
    to: string
    subject: string
    html: string
    text: string
}

const getResendApiKey = () => process.env.RESEND_MAIL_API

const getAppUrl = () =>
    process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

/**
 * Sends an email using the Resend API.
 *
 * @param {Object} params - The parameters for sending the email.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.subject - The subject line of the email.
 * @param {string} [params.html] - The HTML content of the email (optional).
 * @param {string} [params.text] - The plain text content of the email (optional).
 * @throws {Error} If the Resend API key is not configured.
 * @throws {Error} If the Resend API returns a non-OK response.
 * @returns {Promise<Object>} Resolves with the response from the Resend API in JSON format.
 */
export const sendEmail = async ({ to, subject, html, text }: SendEmailParams) => {
    const apiKey = getResendApiKey()
    if (!apiKey) {
        throw new Error("RESEND_MAIL_API is not configured")
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: "UML Pro <noreply@umlpro.app>",
            to: [to],
            subject,
            html,
            text,
        }),
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(`Resend error: ${response.status} ${body}`)
    }

    return await response.json()
}

/**
 * Sends an email invitation to a user to join a specified team.
 *
 * @param {Object} params - Parameters for the email invitation.
 * @param {string} params.email - The email address of the user to invite.
 * @param {string} params.teamName - The name of the team the user is invited to join.
 * @param {string} params.token - A unique token used to accept the invitation.
 * @returns {Promise<void>} A promise that resolves once the email has been successfully sent.
 * @throws {Error} Throws an error if sending the email fails.
 */
export const sendTeamInviteEmail = async ({
    email,
    teamName,
    token,
}: {
    email: string
    teamName: string
    token: string
}) => {
    const appUrl = getAppUrl()
    const acceptLink = `${appUrl}/invite/accept?token=${encodeURIComponent(token)}`

    const subject = `You're invited to join ${teamName}`
    const text = [
        `You've been invited to join ${teamName}.`,
        "",
        `Accept invite: ${acceptLink}`,
        "",
        "If you don't have an account, sign up first.",
    ].join("\n")

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>You're invited to join ${teamName}</h2>
            <p>Use the link below to accept your invite:</p>
            <p><a href="${acceptLink}">Accept invite</a></p>
            <p>If you don't have an account, sign up first.</p>
        </div>
    `

    return await sendEmail({ to: email, subject, html, text })
}
