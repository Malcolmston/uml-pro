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

/**
 * Sends a welcome email to a user when they sign up for the UML Pro service.
 *
 * The email includes a personalized greeting if the user's first name is provided,
 * alongside a standard welcome message and contact information for additional support.
 *
 * @param {string} email - The email address of the recipient.
 * @param {string} [firstName] - An optional first name of the recipient for personalization.
 * @returns {Promise<void>} A promise that resolves when the email has been successfully sent.
 * @throws {Error} If there is an issue sending the email.
 */
export const sendWelcomeEmail = async (email: string, firstName?: string) => {
    const subject = "Welcome to UML Pro"
    const greeting = firstName ? `Hi ${firstName},` : "Hi,"
    const text = [
        greeting,
        "",
        "Welcome to UML Pro. Your workspace is ready.",
        "If you need anything, just reply to this email.",
    ].join("\n")

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>${greeting}</p>
            <p>Welcome to UML Pro. Your workspace is ready.</p>
            <p>If you need anything, just reply to this email.</p>
        </div>
    `

    return await sendEmail({ to: email, subject, html, text })
}

/**
 * Sends an email notification when a user's password is successfully changed.
 *
 * This function sends an email to the specified email address with the
 * subject line "Your UML Pro password was changed" along with a plain text
 * and HTML version of the content. The email informs the recipient that their
 * password was changed and provides instructions on what to do if the change
 * was unauthorized.
 *
 * @param {string} email - The recipient's email address.
 * @returns {Promise<void>} A promise that resolves after the email is sent successfully.
 */
export const sendPasswordChangedEmail = async (email: string) => {
    const subject = "Your UML Pro password was changed"
    const text = [
        "Your password was changed successfully.",
        "If this wasn't you, reset your password immediately.",
    ].join("\n")

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Your password was changed successfully.</p>
            <p>If this wasn't you, reset your password immediately.</p>
        </div>
    `

    return await sendEmail({ to: email, subject, html, text })
}

/**
 * Sends an email notification when a user's account email address has been changed.
 *
 * @param {Object} params - The parameters for the email.
 * @param {string} params.to - The recipient's email address.
 * @param {string} params.newEmail - The new email address for the account.
 * @param {string} params.oldEmail - The previous email address for the account.
 * @param {'notify-new' | 'notify-old'} params.context - Whether this notification is for the new or old email address.
 * @returns {Promise<void>} A promise that resolves when the email has been sent successfully.
 */
export const sendEmailChangedEmail = async ({
    to,
    newEmail,
    oldEmail,
    context,
}: {
    to: string
    newEmail: string
    oldEmail: string
    context: 'notify-new' | 'notify-old'
}) => {
    const isNew = context === 'notify-new'
    const subject = isNew 
        ? "Your UML Pro email has been updated" 
        : "Security Alert: Your UML Pro email was changed"
    
    const text = isNew 
        ? [
            "Your account email has been successfully updated.",
            `New email: ${newEmail}`,
            `Previous email: ${oldEmail}`,
        ].join("\n")
        : [
            "Your account email was changed.",
            `The email was changed to: ${newEmail}`,
            `Previous email: ${oldEmail}`,
            "If you did not authorize this change, please contact support immediately.",
        ].join("\n")

    const html = isNew
        ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Your account email has been successfully updated.</p>
            <p>New email: ${newEmail}</p>
            <p>Previous email: ${oldEmail}</p>
        </div>
    `
        : `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Your account email was changed.</p>
            <p>The email was changed to: ${newEmail}</p>
            <p>Previous email: ${oldEmail}</p>
            <p>If you did not authorize this change, please contact support immediately.</p>
        </div>
    `

    return await sendEmail({ to, subject, html, text })
}

/**
 * Sends an email notification to inform the user that their username has been updated.
 *
 * @param {Object} params - The parameters for the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.username - The updated username to include in the email.
 * @returns {Promise<void>} A promise that resolves when the email has been successfully sent.
 */
export const sendUsernameChangedEmail = async ({
    email,
    username,
}: {
    email: string
    username: string
}) => {
    const subject = "Your UML Pro username was updated"
    const text = [
        "Your username was updated successfully.",
        `New username: ${username}`,
    ].join("\n")

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Your username was updated successfully.</p>
            <p>New username: ${username}</p>
        </div>
    `

    return await sendEmail({ to: email, subject, html, text })
}
