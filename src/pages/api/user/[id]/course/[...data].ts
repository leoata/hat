import {NextApiRequest, NextApiResponse} from "next";
import {PrismaClient, User} from "@prisma/client";
import {MiddlewareResponse, runMiddleware} from "../index";
import {getPrisma} from "../../../_base";



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

    let course = await getPrisma().course.findFirst({
        where: {
            name: data[0],
            description: data[1],
            subject: data[2],
        }
    });

    switch (req.method) {
        case "POST":
            //create a new course
            course = await getPrisma().course.create({
                data: {
                    name: data[0],
                    description: data[1],
                    subject: data[2],
                    teacher: data[3] ?? null,
                    User: {connect: {providerId: user.providerId}},
                }
            });
            console.log("created course " + JSON.stringify(course));
            return res.status(200).json(course);
        case "DELETE":
            if (!course)
                break;
            //delete a course
            await getPrisma().course.delete({
                where: {
                    id: course.id
                }
            });
            res.status(200).json({message: "Course deleted"});

            console.log("deleted course " + JSON.stringify(course))
            return res.status(200).json(course);
        case "PUT":
            //update a course
            if (!course)
                break;
            course = await getPrisma().course.update({
                where: {
                    id: course.id
                },
                data: {
                    name: data[0],
                    description: data[1],
                    subject: data[2],
                    teacher: data[3] ?? course.teacher,
                }
            });
            res.status(200).json({message: "Course updated"});
            console.log("updated course " + JSON.stringify(course))
            return res.status(200).json(course);
        case "GET":
            //get a course
            if (!course)
                break;
            console.log("got course " + course)
            return res.status(200).json(course);
        default:
            res.status(400).json({
                statusCode: 400,
                body: {
                    message: "Invalid method"
                }
            });
            res.end();
            return null;
    }
    res.status(500).json({
        statusCode: 500,
        body: {
            message: "Internal server error"
        }
    });
}
