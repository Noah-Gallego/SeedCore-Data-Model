import { NextResponse, NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

// IMPORTANT: Use environment variables for sensitive data in production
// Example: process.env.EMAIL_SERVER_USER, process.env.EMAIL_SERVER_PASSWORD, etc.
const EMAIL_TO = 'gobeyondmeasure.org'; // As requested
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@yourdomain.com'; // Replace with your sending email or use env var
const SMTP_OPTIONS = {
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com', // Replace with your SMTP host or use env var
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10), // Replace with your SMTP port or use env var
    // secure: true, // Use true for port 465, false for others (like 587)
    auth: {
        user: process.env.EMAIL_SERVER_USER || 'your_username', // Replace with your SMTP username or use env var
        pass: process.env.EMAIL_SERVER_PASSWORD || 'your_password', // Replace with your SMTP password or use env var
    },
};

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        // Basic validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport(SMTP_OPTIONS);

        const mailOptions = {
            from: `"${name}" <${EMAIL_FROM}>`, // Sender address (using configured sender)
            replyTo: email,                   // Set reply-to to the user's email
            to: EMAIL_TO,                     // List of receivers
            subject: `Contact Form: ${subject}`, // Subject line
            text: `Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`, // Plain text body
            html: `<p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                   <p><strong>Subject:</strong> ${subject}</p>
                   <hr>
                   <p><strong>Message:</strong></p>
                   <p>${message.replace(/\n/g, '<br>')}</p>`, // HTML body
        };

        try {
             await transporter.sendMail(mailOptions);
             console.log('Email sent successfully to', EMAIL_TO);
             return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
        } catch (mailError: any) {
             console.error('Error sending email:', mailError);
             // Provide more specific error info if available
             const errorMessage = mailError.response || mailError.message || 'Internal server error during email sending';
             const errorStatus = mailError.responseCode || 500;
             return NextResponse.json({ message: `Failed to send email: ${errorMessage}` }, { status: errorStatus });
        }

    } catch (error: any) {
        console.error('Error processing request:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
} 