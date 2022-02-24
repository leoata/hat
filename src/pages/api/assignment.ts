import {NextApiRequest, NextApiResponse} from "next";
import {getSession} from "next-auth/react";
import {isAuthorized, runRateLimitMiddleware} from "./_base";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({req})
    if (!session || !isAuthorized(session)) // need !session to satisfy typescript
        return res.status(401).json({error: "Unauthorized"})
    const body = req.body;

    if (body.dueDate && Number.isNaN(Date.parse(body.dueDate)))
        return res.status(400).json({error: "Invalid dueDate format"});
    const rateLimitRes = runRateLimitMiddleware(session.providerId as string);
    if (rateLimitRes) {
        return res.status(429).json({error: "Too many requests"});
    }
    let assignment;
    switch (req.method) {
        case "GET":
            if (body && body.id != null)
                assignment = prisma.assignment.findUnique({
                    where: {
                        UniqueUserAssignment: {
                            id: body.id,
                            userId: session.providerId as string
                        }
                    },
                    include: {
                        course: true,
                    }
                });
            else
                assignment = prisma.assignment.findMany({
                    where: {
                        userId: session.providerId as string,
                    },
                    include: {
                        course: true
                    }
                });
            return assignment.then((assignment: any) => {
                return res.status(200).json(assignment);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
            break;
        case "POST":
            if (!body || !body.courseId || !body.name || !body.dueDate || body.isTest === undefined)
                return res.status(400).json({error: "Missing required fields"});
            assignment = prisma.assignment.create({
                data: {
                    name: body.name,
                    isTest: body.isTest,
                    description: body.description ?? undefined,
                    dueDate: body.dueDate,
                    course: {connect: {id: body.courseId}},
                    user: {connect: {providerId: session.providerId as string}}
                }
            });
            return assignment.then((assignment: any) => {
                return res.status(200).json(assignment);
            }).catch((err: any) => {
                return res.status(404).json("Not Found");
            })
            break;
        case "PUT":
            if (!body || !(body.priorities || body.id))
                return res.status(400).json({error: "Missing required fields"});
            if (body.priorities && body.priorities.length <= 0)
                return res.status(200).json({message: "nothing to update"}); // respond successfully
            if (body.priorities) {
                /*
            [
                {priority: 0, assignments: ["dsad","dasdsa"]},
                {priority: 2, assignments: ["3r15r","saj01i"]}
            ]
             */
                //idk how to do many to many updates so this is good enough
                for (const s of body.priorities) {
                    await prisma.assignment.updateMany({
                        where: {
                            id: {
                                in: s.assignments
                            }
                        },
                        data: {
                            priority: s.priority
                        }
                    });
                }
                return res.status(200).json({message: "updated"});
            } else {
                assignment = prisma.assignment.update({
                    where: {
                        UniqueUserAssignment: {
                            id: body.id,
                            userId: session.providerId as string
                        }
                    },
                    data: {
                        name: body.name ?? undefined,
                        priority: body.priority !== undefined ? body.priority : undefined,
                        isTest: body.isTest !== undefined ? body.isTest : undefined,
                        completed: body.completed !== undefined ? body.completed : undefined,
                        description: body.description ?? undefined,
                        dueDate: body.dueDate ?? undefined,
                    }
                });
                return assignment.then((assignment: any) => {
                    return res.status(200).json(assignment);
                }).catch((err: any) => {
                    console.log(err)
                    return res.status(404).json("Not Found");
                })
            }
        case "DELETE":
            if (!body || !body.id)
                return res.status(400).json({error: "Missing required fields"});

            assignment = prisma.assignment.delete({
                where: {
                    UniqueUserAssignment: {
                        id: body.id,
                        userId: session.providerId as string
                    }
                }
            });
            return assignment.then((assignment: any) => {
                return res.status(200).json(assignment);
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
