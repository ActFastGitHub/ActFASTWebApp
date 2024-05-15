import { NextAuthOptions } from "next-auth";
import prisma from "@/app/libs/prismadb";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcrypt";
import { validateEmail } from "@/app/libs/validations";

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		FacebookProvider({
			clientId: process.env.FACEBOOK_ID!,
			clientSecret: process.env.FACEBOOK_SECRET!,
			profile: async profile => {
				return {
					id: profile.id,
					name: profile.name,
					email: profile.email,
					image: profile.picture.data.url,
					provider: "facebook"
				};
			}
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID!,
			clientSecret: process.env.GOOGLE_SECRET!,
			profile: async profile => {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					provider: "google"
				};
			}
		}),
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" },
				username: {
					label: "Username",
					type: "text",
					placeholder: "John Smith"
				}
			},
			authorize: async credentials => {
				if (!credentials?.email) throw new Error("Please enter your email");
				if (!validateEmail(credentials.email)) throw new Error("Please enter a valid email");
				if (!credentials?.password) throw new Error("Please enter your password");

				const emailExistDifferentAccount = await prisma.user.findUnique({
					where: {
						email: credentials.email,
						NOT: {
							provider: "credentials"
						}
					}
				});

				const user = await prisma.user.findUnique({
					where: {
						email: credentials.email,
						provider: "credentials"
					}
				});

				const hashPassword = user?.hashedPassword;

				if (emailExistDifferentAccount) {
					throw new Error("An account with this email already exists. Please login accordingly.");
				}

				if (!user || !hashPassword) {
					throw new Error("No such user account exists yet");
				}

				const passwordMatch = await bcrypt.compare(credentials.password, hashPassword!);

				if (!passwordMatch) {
					throw new Error("The password entered seems to be incorrect");
				}

				return user;
			}
		})
	],
	secret: process.env.SECRET,
	session: {
		strategy: "jwt"
	},
	callbacks: {
		async signIn({ account, profile }) {
			if (account?.provider === "google" && profile) {
				const existingUser = await prisma.user.findUnique({
					where: {
						email: profile?.email!,
						NOT: {
							provider: "google"
						}
					}
				});
				if (existingUser) {
					return false;
				}
			}

			if (account?.provider === "facebook" && profile) {
				const existingUser = await prisma.user.findUnique({
					where: {
						email: profile?.email!,
						NOT: {
							provider: "facebook"
						}
					}
				});
				if (existingUser) {
					return false;
				}
			}

			return true;
		},
		async jwt({ token, user, session, account, profile }) {
			console.log("JWT CALLBACK", { token, user, session, account, profile });

			if (account) {
				token.provider = account.provider;
			}
			return token;
		},
		async session({ session, user, token }) {
			const userProfile = await prisma.profile.findUnique({
				where: {
					userEmail: session?.user?.email!
				}
			});

			if (!userProfile) {
				session!.user!.isNewUser = true;
			} else {
				session!.user!.isNewUser = false;
			}

			if (token) {
				session.user.provider = token.provider;
			}

			console.log("SESSION CALLBACK", { session, user, token });
			return session;
		}
	},
	pages: {
		error: "/login"
	},
	debug: process.env.NODE_ENV === "development"
};