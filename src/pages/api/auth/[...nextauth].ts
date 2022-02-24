import NextAuth, {Awaitable, Session} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "../../../../lib/prisma";


export default NextAuth({
    // Configure one or more authentication providers
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENTID as string,
            clientSecret: process.env.GOOGLE_CLIENTSECRET as string,
        }),
        // ...add more providers here
    ],
    callbacks: {
        async signIn({account, profile}): Promise<boolean> {
            if (!profile.email || !profile.sub || !profile.email_verified)
                return false;

            const user = await prisma.user.findUnique({
                where: {providerId: account.provider + "|" + profile.sub},
                include: {courses: true},
            })

            if (!user) {
                // use the events.createUser event to create a new user later on instead
                await prisma.user.create({
                    data: {
                        providerId: account.provider + "|" + profile.sub,
                        email: profile.email,
                        name: profile.name ?? profile.nickname as string | undefined ?? profile.email,
                    },
                });
                console.log("created user: " + (account.provider + "|" + profile.sub))
            } else
                console.log("found user: " + user.providerId)
            return true;
        },
// @ts-ignore
        session: async ({session, user, token}): Awaitable<Session> => {
            if (!token || !token.email) {
                session.providerId = null;
                return session;
            }
            if (!session.providerId)
                session.providerId = "google|" + token.sub; // assume provider is google for now
            return session;
        },

    }
});
