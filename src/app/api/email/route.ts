import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { issue, wallet, platform, option, additionalDetails } = await req.json();

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    // Verify transporter connection
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('Transporter verification failed:', error);
          reject(error);
        } else {
          console.log('Transporter verified successfully');
          resolve(success);
        }
      });
    });

    // Email sending logic
    const recipients = [process.env.RECIPIENT1, process.env.RECIPIENT2];
    for (const recipient of recipients) {
      const mailOpts = {
        from: process.env.MAIL_USERNAME,
        to: recipient,
        subject: `New Issue Reported: ${issue}`,
        text: `
        Issue: ${issue}
        Wallet: ${wallet}
        Platform: ${platform}
        Connection Method: ${option}
        Additional Details: ${additionalDetails}
        `,
        html: `
        <h2>New Issue Reported</h2>
        <p><strong>Issue:</strong> ${issue}</p>
        <p><strong>Wallet:</strong> ${wallet}</p>
        <p><strong>Platform:</strong> ${platform}</p>
        <p><strong>Connection Method:</strong> ${option}</p>
        <p><strong>Additional Details:</strong> ${additionalDetails}</p>
        `,
      };

      // Send email
      await new Promise((resolve, reject) => {
        transporter.sendMail(mailOpts, (error, info) => {
          if (error) {
            console.error('Failed to send email:', error);
            reject(error);
          } else {
            console.log(`Email sent to ${recipient}: ${info.response}`);
            resolve(info);
          }
        });
      });
    }

    // Return success response after all emails are sent
    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error in email handler:', error);

    // Return error response
    return NextResponse.json({ message: 'Failed to send emails', error: error.message }, { status: 500 });
  }
}
