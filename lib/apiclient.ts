// dueDate in ISO format
import {getBaseUrl} from "../src/util/envUtil";

export const saveNewAssignment = (setGlobalState: any, globalState: any, setLoading: any, router: any,
                                  course: any, name: string, isTest: boolean, dueDate: string) => {
    fetch(getBaseUrl() + "/api/assignment",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                courseId: course.id,
                name: name,
                isTest: isTest,
                dueDate: dueDate
            })
        })
        .then(res => getCourseAndUserData(setGlobalState, globalState, setLoading, router))
        .catch(err => console.error(err))
}

export async function saveNewCourse(setGlobalState: any, globalState: any, setLoading: any, router: any,
                                    courseName: string, subject: string, description: string | undefined, teacher: string | undefined) {
    const response = await fetch(getBaseUrl() + "/api/course",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: courseName,
                subject: subject,
                description: description,
                teacher: teacher
            })
        }).then(async (response) => {
        await getCourseAndUserData(setGlobalState, globalState, setLoading, router)
        return response;
    })
    return response.json();
}

export async function getCourseAndUserData(setGlobalState: any, globalState: any, setLoading: any, router: any) {
    fetch(getBaseUrl() + "/api/course")
        .then((res) => res.json())
        .then((courses) => {

            if (!courses || courses.length == 0) {
                fetch(getBaseUrl() + "/api/user")
                    .then((res) => res.json())
                    .then((data) => {
                        setGlobalState({
                            ...globalState,
                            userData: {
                                data: {user: data, courses: []},
                                lastUpdated: Date.now()
                            }
                        });
                    })
                    .catch((err: any) => {
                        console.log(err)
                        router.replace("/");
                        return null;
                    });
            }
            for (let i = 0; i < courses.length; ++i) {
                courses[i] = {
                    ...courses[i],
                    assignments: courses[i].assignments.filter((assignment: any) => !assignment.completed)
                }
            }
            setGlobalState({
                ...globalState,
                userData: {
                    data: {
                        courses: courses,
                        user: courses[0].user
                    },
                    lastUpdated: Date.now()
                }
            });
            setLoading(false);
        })
        .catch((err: any) => {
            console.log(err)
            router.replace("/");
            return null;
        });
}

export async function saveAssignmentPriorities(priorities: string[][], setPriorities: (priorities: string[][]) => void,
                                               setLastPriorityUpdate?: (lastPriorityUpdate: number) => void) {
    const data = [];
    for (let i = 0; i < priorities.length; i++) {
        if (priorities[i] && priorities[i].length > 0) {
            data.push({priority: i, assignments: priorities[i].toString()});
            priorities[i] = [];
        }
    }
    /*
    [
        {priority: 0, assignments: ["dsad","dasdsa"]},
        {priority: 2, assignments: ["3r15r","saj01i"]}
    ]
     */
    if (data.length > 0) {
        if (setLastPriorityUpdate)
            setLastPriorityUpdate(Date.now());
        await fetch(getBaseUrl() + "/api/assignment", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({priorities: data})
        }).catch((err: any) => console.log(JSON.stringify(err))).then((res) => {
            setPriorities([[], [], []])
        });
    }
}

export const setComplete = async (id: string, setGlobalState: any, globalState: any, setLoading: any, router: any) => {
    await fetch(getBaseUrl() + "/api/assignment", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id, completed: true})
    }).catch((err: any) => console.log(JSON.stringify(err)));
    await getCourseAndUserData(setGlobalState, globalState, setLoading, router);
}

export const deleteAssignment = async (id: string, setGlobalState: any, globalState: any, router: any) => {
    await fetch("/api/assignment", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: id})
    }).then(() => {
        getCourseAndUserData(setGlobalState, globalState, (s: boolean) => null, router);
    });
};
