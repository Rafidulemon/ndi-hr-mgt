import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { prisma } from "@/prisma";

const TOKEN_TTL_MINUTES = 30;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? normalizeEmail(body.email) : "";

    if (!email) {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    });

    if (user) {
      const baseSecret =
        process.env.NEXT_PUBLIC_JWT_SECRET ||
        process.env.JWT_SECRET ||
        process.env.AUTH_SECRET;

      if (!baseSecret) {
        throw new Error("JWT secret is not configured.");
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          purpose: "password-reset",
        },
        baseSecret,
        { expiresIn: `${TOKEN_TTL_MINUTES}m` },
      );

      const emailUser = process.env.NEXT_PUBLIC_EMAIL_USER;
      const emailPass = process.env.NEXT_PUBLIC_EMAIL_PASS;

      if (!emailUser || !emailPass) {
        throw new Error("Email credentials are not configured.");
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      const resetLink = `${getBaseUrl()}/auth/reset-password?token=${encodeURIComponent(token)}`;

      await transporter.sendMail({
        from: emailUser,
        to: user.email,
        subject: "Reset your NDI HR password",
        text: [
          "We received a request to reset the password on your NDI HR account.",
          `Use the secure link below to choose a new password (valid for ${TOKEN_TTL_MINUTES} minutes):`,
          "",
          resetLink,
          "",
          "If you didn't request this, you can ignore this email - your password will stay the same.",
        ].join("\n"),
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <p>We received a request to reset the password on your NDI HR account.</p>
            <p>
              Use the secure link below to choose a new password.
              This link expires in ${TOKEN_TTL_MINUTES} minutes.
            </p>
            <p style="margin: 24px 0;">
              <a
                href="${resetLink}"
                style="background: #4f46e5; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;"
              >
                Reset password
              </a>
            </p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      message: "If that account exists, a reset link is on the way.",
    });
  } catch (error) {
    console.error("Failed to send reset email:", error);
    return NextResponse.json(
      { message: "Failed to send password reset email." },
      { status: 500 },
    );
  }
}
