import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/google"
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GithubProvider({
            clientId: process.env.GOOGLE_CLIENTID as string,
            clientSecret: process.env.GOOGLE_CLIENTSECRET as string,
        }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn({account, profile}): Promise<boolean> {
            if (!profile.email || !profile.sub || !profile.email_verified)
                return false;
            if (account.provider === "google") {
                if (!profile.email || !profile.email_verified)
                    return false;
            }

            const user = await prisma.user.findUnique({
                where: {providerId: account.provider + "|" + profile.sub},
                include: {courses: true},
            })
            if (!user) {
                await prisma.user.create({
                    data: {
                        providerId: account.provider + "|" + profile.sub,
                        email: profile.email,
                        name: profile.name ?? profile.nickname as string | undefined ?? profile.email,
                    },
                });
                console.log("created user: " + (account.provider + "|" + profile.sub))
            }else
                console.log("found user: " + user.providerId)
            return true;
        },
    }
});
