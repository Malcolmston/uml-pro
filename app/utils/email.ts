type SendEmailParams = {
    to: string
    subject: string
    html: string
    text: string
}

const getResendApiKey = () => process.env.RESEND_MAIL_API

const getAppUrl = () =>
    process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

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
