import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { RegistrationStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password or OTP", type: "text" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || (!credentials?.password && !credentials?.otp)) {
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: { equals: credentials.identifier, mode: 'insensitive' } },
                { email: { equals: credentials.identifier, mode: 'insensitive' } }
              ]
            }
          });

          if (!user) {
            console.error("User not found:", credentials.identifier);
            return null;
          }

          console.log("User found for authentication:", {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status
          });

          // Check status first
          if (user.status !== RegistrationStatus.APPROVED) {
            throw new Error(
              user.status === RegistrationStatus.PENDING
                ? 'PENDING_VERIFICATION'
                : 'REGISTRATION_REJECTED'
            );
          }

          // Case 1: OTP Authentication (Available for ALL approved users if OTP is provided)
          if (credentials.otp && credentials.otp !== 'undefined') {
            // Verify OTP
            if (!user.otp || user.otp !== credentials.otp) {
              console.error("Invalid OTP for user:", credentials.identifier);
              throw new Error('INVALID_OTP');
            }

            // Check if OTP is expired
            if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
              console.error("OTP expired for user:", credentials.identifier);
              throw new Error('OTP_EXPIRED');
            }

            // Clear OTP after successful verification
            await prisma.user.update({
              where: { id: user.id },
              data: {
                otp: null,
                otpExpiresAt: null
              }
            });

            console.log("OTP authentication successful:", { id: user.id, email: user.email, role: user.role });

            return {
              id: user.id,
              username: user.username,
              role: user.role,
              fullName: user.fullName,
              email: user.email,
              status: user.status,
              gaamId: user.gaamId
            };
          }

          // Case 2: Password Authentication (Only for ADMIN and SUPER_ADMIN)
          if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.GAAM_ADMIN) {
            if (!credentials.password) {
              console.error("Password not provided for admin user:", credentials.identifier);
              return null;
            }

            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isPasswordValid) {
              console.error("Invalid password for user:", credentials.identifier);
              return null;
            }

            console.log("Admin password authentication successful:", { id: user.id, email: user.email, role: user.role });

            return {
              id: user.id,
              username: user.username,
              role: user.role,
              fullName: user.fullName,
              email: user.email,
              status: user.status,
              gaamId: user.gaamId
            };
          }

          // Case 3: Member trying to use password (Not allowed)
          if (user.role === UserRole.MEMBER && !credentials.otp) {
            console.error("Member attempted password login or missing OTP:", credentials.identifier);
            throw new Error('OTP_REQUIRED');
          }

          return null;
        } catch (error) {
          if (error instanceof Error && (
            error.message === 'OTP_REQUIRED' ||
            error.message === 'INVALID_OTP' ||
            error.message === 'OTP_EXPIRED' ||
            error.message === 'PENDING_VERIFICATION' ||
            error.message === 'REGISTRATION_REJECTED'
          )) {
            throw error;
          }
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.fullName = user.fullName as string;
        token.email = user.email as string;
        token.status = user.status as string;
        token.gaamId = (user as any).gaamId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.fullName = token.fullName as string;
        session.user.email = token.email as string;
        session.user.status = token.status as string;
        session.user.gaamId = token.gaamId as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
  }
};