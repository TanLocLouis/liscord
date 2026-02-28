import nodemailer from "nodemailer";

function generateVerificationEmail(token) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; color: #333; }
      .email-container { max-width: 600px; margin: 20px auto; background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
      .email-header { font-size: 20px; font-weight: bold; text-align: center; color: #0056b3; margin-bottom: 20px; }
      .email-body { font-size: 16px; }
      .email-link { display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #d7dfe8; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; }
    </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">Verify Your Signup</div>
        <div class="email-body">
          <p>Welcome! Please use the code below to verify your Liscord account.</p>
          <a class="email-link" href="${token}">
            Verify Account
          </a>
        </div>
        <div class="email-footer"><p>If you didn’t request this email, you can safely ignore it.</p></div>
      </div>
    </body>
    </html>
  `;
}

export async function sendMail(email, verificationLink) {
  if (!process.env.GMAIL_MAIL || !process.env.GMAIL_MAIL_TOKEN) {
    console.warn(
      "[WARN] Mail credentials not set (GMAIL_MAIL / GMAIL_MAIL_TOKEN). Email sending will likely fail."
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_MAIL,
        pass: process.env.GMAIL_MAIL_TOKEN,
      },
    });

    const email_content = generateVerificationEmail(verificationLink);
    const mailOptions = {
      from: process.env.VITE_MAIL,
      to: email,
      subject: "ACCOUNT CONFIRMATION",
      html: email_content,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error("[ERROR] MAIL SENDER: ", err);
    throw err;
  }
}