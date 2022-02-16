import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import prisma from "../../../lib/prisma";
import {isAuthorized} from "./_base";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") // invalid method
        return res.status(405).json({error: "Method not allowed. Use Sign In Button"})
    const session = await getSession({req})
    if (!session || !isAuthorized(session)) // need !session to satisfy typescript
        return res.status(401).json({error: "Unauthorized"})
    const body = req.body;

    const providerId = session.providerId as string;

    let user;
    switch (req.method) {
        case "GET":
            user = prisma.user.findUnique({
                    where: {providerId: providerId},
                    include: {
                        courses: body.courses !== undefined,
                        assignments: body.assignments !== undefined
                    }
                }
            );

            return user.then((user: any) => {
                return res.status(200).json(user);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        case "DELETE":
            user = prisma.user.delete({where: {providerId: providerId}});

            return user.then((user: any) => {
                return res.status(200).json(user);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        case "PUT":
            user = prisma.user.update({
                where: {providerId: providerId},
                data: {
                    name: body.name ?? undefined, // only updatable parameter
                }
            })
            return user.then((user: any) => {
                return res.status(200).json(user);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        default:
            return res.status(405).json({error: "Method not allowed."})

    }
}
