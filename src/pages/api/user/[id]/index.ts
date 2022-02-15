import {PrismaClient, User} from "@prisma/client"
import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import {getPrisma} from "../../_base";

export type MiddlewareResponse = {
    statusCode: number,
    body: any
};

export async function runMiddleware(req: NextApiRequest): Promise<MiddlewareResponse | User> {
    let {id} = req.query;
    const session = await getSession({req})
    if (!session || !session.user || !session.expires || Number.isNaN(Date.parse(session.expires))
        || Date.parse(session.expires) < Date.now()) {
        return {statusCode: 401, body: "Unauthorized"};
    }

    if (!id) {
        return {statusCode: 400, body: "You must provide an id"};
    }

    id = id as string;
    const isId = id.includes("|"); // otherwise its an email
    let user;
    if (isId)
        user = await getPrisma().user.findUnique({
            where: {
                providerId: id
            },
            include: {courses: true},
        })
    else
        user = await getPrisma().user.findUnique({
            where: {
                email: id
            },
            include: {courses: true},
        })

    if (!user) {
        return {statusCode: 401, body: "Unauthorized"};
    }

    if (!user || user.email !== session.user.email) {
        return {statusCode: 401, body: "Unauthorized"};
    }

    return user;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userRes = await runMiddleware(req);
    if ((userRes as MiddlewareResponse).statusCode) {
        const midRes = userRes as MiddlewareResponse;
        res.status(midRes.statusCode).json(midRes.body);
        res.end();
        return null;
    }

    const user = userRes as User;

    switch (req.method) {
        case "PUT":
            //update courses through the course endpoint
            return res.status(405).end();
        case "POST":
            //create users through the signin callback
            return res.status(405).end();
        case "DELETE":
            await getPrisma().user.delete({where: {providerId: user.providerId}});
            return res.status(200).end();
        case "GET":
            return res.json(user);
        default:
            //invalid method
            return res.status(405).end();

    }

}
