import { PrismaClient } from "@prisma/client";
import {Session} from "next-auth/core/types";

export function isAuthorized(session: Session | null) {
    return (session && session.user && session.expires && !Number.isNaN(Date.parse(session.expires))
        && Date.parse(session.expires) > Date.now());
}
