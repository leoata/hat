import {PrismaClient, User} from "@prisma/client"
import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import {number} from "prop-types";

const prisma = new PrismaClient()

export type MiddlewareResponse = {
    statusCode: number,
    body: any
};

export async function runMiddleware(req: NextApiRequest): Promise<MiddlewareResponse | User> {
    const {id} = req.query;
    const session = await getSession({req})
    if (!session || !session.user || !session.expires || Number.isNaN(Date.parse(session.expires))
        || Date.parse(session.expires) < Date.now()) {
        return {statusCode: 401, body: "Unauthorized"};
    }
    if (!id) {
        return {statusCode: 400, body: "You must provide an id"};
    }
    const user = await prisma.user.findUnique({
        where: {providerId: id as string},
        include: {courses: true},
    })
    if (!user || user.email !== session.user.email) {
        return {statusCode: 401, body: "Unauthorized"};
    }
    return user;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await runMiddleware(req);
    if ((user as MiddlewareResponse).statusCode) {
        const midRes = user as MiddlewareResponse;
        res.status(midRes.statusCode).json(midRes.body);
        res.end();
        return null;
    }

    return res.json(user);
}
