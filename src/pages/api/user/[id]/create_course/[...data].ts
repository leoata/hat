import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient, User} from "@prisma/client";
import {MiddlewareResponse, runMiddleware} from "../index";

const prisma = new PrismaClient()


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userRes = await runMiddleware(req);
    if ((userRes as MiddlewareResponse).statusCode) {
        const midRes = userRes as MiddlewareResponse;
        res.status(midRes.statusCode).json(midRes.body);
        res.end();
        return null;
    }
    const user = userRes as User;
    const {...slug} = req.query;
    console.log(JSON.stringify(slug));
    const {id, data} = slug;

    if (data.length < 3) {
        res.status(400).json({
            statusCode: 400,
            body: {
                message: "Invalid data"
            }
        });
        res.end();
        return null;
    }

    //we don't care if the course already exists

     await prisma.course.create({
        data: {
            name: data[0],
            description: data[1],
            subject: data[2],
            teacher: data[3] ?? null,
            User: {connect: {providerId: user.providerId}},
        }
    });

    res.status(200).json({message: "Course created"})
    // check if course already exists in database


}
