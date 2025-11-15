/**
 * Send invitation email to secondary parent
 * In production, this would integrate with an email service (SendGrid, Resend, etc.)
 */

/**
 * Send invitation email
 * @param invitedEmail - Email address of invited parent
 * @param token - Invitation token
 * @param childName - Name of child being shared
 * @param inviterName - Name of primary parent (optional)
 */
export async function sendInvitationEmail(
	invitedEmail: string,
	token: string,
	childName: string,
	inviterName?: string
): Promise<void> {
	// In production, integrate with email service
	// For now, log the invitation link
	const acceptanceUrl = `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/invitations/${token}`;

	console.log('=== INVITATION EMAIL ===');
	console.log(`To: ${invitedEmail}`);
	console.log(`Subject: You've been invited to view ${childName}'s reading progress`);
	console.log(`Body: ${inviterName || 'A parent'} has invited you to view ${childName}'s reading progress.`);
	console.log(`Accept invitation: ${acceptanceUrl}`);
	console.log('=======================');

	// TODO: Integrate with email service (SendGrid, Resend, etc.)
	// Example:
	// await emailService.send({
	//   to: invitedEmail,
	//   subject: `You've been invited to view ${childName}'s reading progress`,
	//   html: generateInvitationEmailTemplate(acceptanceUrl, childName, inviterName)
	// });
}

