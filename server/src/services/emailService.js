import nodemailer from "nodemailer";
import { env } from "../shared/config/env.js";
import { AppError } from "../shared/errors/AppError.js";
let transporter;
function getTransporter() {
  if (!env.smtpHost) throw new AppError("SMTP_HOST must be configured before sending email", 500);
  if (!transporter) transporter = nodemailer.createTransport({ host: env.smtpHost, port: env.smtpPort, secure: env.smtpSecure, auth: env.smtpUser && env.smtpPassword ? { user: env.smtpUser, pass: env.smtpPassword } : undefined });
  return transporter;
}
export const emailService = {
  async verifyConnection() { await getTransporter().verify(); },
  sendWelcomeEmail({ email, username }) { return sendEmail({ to: email, subject: "Welcome to TribeTalk!", text: `Hi ${username}, welcome to TribeTalk. Create or join a server and start connecting with your community.`, html: welcomeEmailTemplate(username) }); },
  sendFriendRequestEmail({ recipientEmail, senderName, friendRequestUrl }) { return sendEmail({ to: recipientEmail, subject: `${senderName} sent you a friend request on TribeTalk`, text: `${senderName} sent you a friend request on TribeTalk. Open TribeTalk to respond: ${friendRequestUrl}`, html: `<main style="max-width:600px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#171717;background:#fff9e8;"><h1 style="color:#536dfe;">You have a new friend request</h1><p><strong>${escapeHtml(senderName)}</strong> sent you a friend request on TribeTalk.</p><a href="${escapeHtml(friendRequestUrl)}">View friend request</a></main>` }); },
  sendMentionEmail({ recipientEmail, senderName, content, messageUrl }) { return sendEmail({ to: recipientEmail, subject: `${senderName} mentioned you on TribeTalk`, text: `${senderName} mentioned you: ${content}\n\nView message: ${messageUrl}`, html: `<main style="max-width:600px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#171717;background:#fff9e8;"><h1 style="color:#536dfe;">You were mentioned</h1><p><strong>${escapeHtml(senderName)}</strong> mentioned you in a channel.</p><blockquote style="border-left:4px solid #536dfe;padding-left:12px;">${escapeHtml(content)}</blockquote><a href="${escapeHtml(messageUrl)}">View message</a></main>` }); }
};
async function sendEmail({ to, subject, text, html }) {
  const info = await getTransporter().sendMail({ from: env.emailFrom, to, subject, text, html });
  if (info.rejected?.length || !info.accepted?.length) throw new AppError("SMTP provider did not accept the email recipient", 502);
  return { messageId: info.messageId, response: info.response, acceptedCount: info.accepted.length, rejectedCount: info.rejected?.length ?? 0, recipientDomain: to.split("@")[1] ?? "unknown" };
}
function welcomeEmailTemplate(username) { return `<main style="max-width:600px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#171717;background:#fff9e8;"><h1 style="color:#536dfe;">Welcome to TribeTalk, ${escapeHtml(username)}!</h1><p>Your account is ready. Create or join a server and start connecting with your community.</p><p>The TribeTalk Team</p></main>`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character]); }
