import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import {isAuthorized} from "./_base";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({req})
    if (!session || !isAuthorized(session)) // need !session to satisfy typescript
        return res.status(401).json({error: "Unauthorized"})
    const body = req.body;

    let course;
    switch (req.method) {
        case "GET":
            if (body && body.courseId != null) {
                course = prisma.course.findUnique({
                    where: {
                        course_user_unique: {
                            id: body.courseId,
                            userId: session.providerId as string
                        }
                    },
                    include: {
                        User: true,
                        assignments: true,
                    }
                });
            }else
                course = prisma.course.findMany({
                    where: {
                        User: {
                            providerId: session.providerId as string
                        }
                    },
                    include: {
                        User: true,
                        assignments: true,
                    }
                });
            return course.then((course: any) => {
                return res.status(200).json(course);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        case "POST":
            if (!body || !body.name || !body.description || !body.subject)
                return res.status(400).json({error: "Missing required fields"});

            course = prisma.course.create({
                data: {
                    name: body.name,
                    description: body.description,
                    subject: body.subject,
                    teacher: body.teacher ?? undefined,
                    User: {connect: {providerId: session.providerId as string}}
                }
            });
            return course.then((course: any) => {
                console.log("created course " + JSON.stringify(course));
                return res.status(200).json(course);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        case "PUT":
            if (!body || !body.courseId)
                return res.status(400).json({error: "Missing required fields"});
            course = prisma.course.update({
                where: {
                    course_user_unique: {
                        id: body.courseId,
                        userId: session.providerId as string
                    }
                },
                data: {
                    name: body.name ?? undefined,
                    description: body.description ?? undefined,
                    subject: body.subject ?? undefined,
                    teacher: body.teacher ?? undefined,
                    emoji: body.emoji ?? undefined

                }
            });
            return course.then((course: any) => {
                console.log("updated course " + JSON.stringify(course));
                return res.status(200).json(course);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        case "DELETE":
            if (!body || !body.courseId)
                return res.status(400).json({error: "Missing required fields"});
            //delete a course
            course = prisma.course.delete({
                where: {
                    course_user_unique: {
                        id: body.courseId,
                        userId: session.providerId as string
                    }
                }
            });
            return course.then((course: any) => {
                console.log("deleted course " + JSON.stringify(course));
                return res.status(200).json(course);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
        default:
            res.status(405).json({
                message: "Method not allowed"
            });
            break;
    }

}
