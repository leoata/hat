import {getSession, useSession} from "next-auth/react";
import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardBody, CardFooter, CardHeader, Heading, Select, Text, Grid} from "grommet";
import {getBaseUrl} from "../util/envUtil";
import {useRouter} from "next/router";
import {animated, useSpring} from "react-spring";
import {Add} from "grommet-icons";
import {useGlobalState} from "../store";
import {Session} from "next-auth/core/types";
import {User, Assignment, Course} from "@prisma/client";
import AssignmentCard from "../components/AssignmentCard";

//possibly add ability to add metadata to tests and assignments so have all data in one spot. is it open note, on
// canvas or paper, priority, etc.

function Dashboard() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [globalState, setGlobalState] = useGlobalState();
    const [isLoading, setLoading] = useState(
        !globalState.userData.data || Date.now() - globalState.userData.lastUpdated > 1000 * 60 * 60 * 24);
    const [addClickAnim, setAddClickAnim] = useSpring(() => ({
        fill: "#000000",
        config: {duration: 200}
    }));

    if (!session || !session.user || !session.user.email) {
        router.replace("/");
        return null;
    }

    useEffect(() => {
        // dont bother with super stale data
        if (!globalState.userData.data || Date.now() - globalState.userData.lastUpdated > 1000 * 60 * 60 * 24) // 1 day
            setLoading(true)
        const courses = fetch(getBaseUrl() + "/api/course")
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
                    return;
                }
                setGlobalState({
                    ...globalState,
                    userData: {
                        data: {courses: courses, user: courses[0].user},
                        lastUpdated: Date.now()
                    }
                });
            })
            .catch((err: any) => {
                console.log(err)
                router.replace("/");
                return null;
            });
        setLoading(false);
    }, []);


    if (isLoading) return <Heading className={"center"} level={"1"}>Loading...</Heading>
    if (globalState.userData.lastUpdated === 0) return <p>No profile data</p>

    const genRepeatArray = (key: string, cnt: number) => Array.from(Array(cnt).keys()).map(x => key);

    const AnimatedAdd = animated(Add);

    let gridCnt = -1;
    let cardCount = globalState.userData.data ?
        globalState.userData.data.courses.map((course: any) => course.assignments).flat().length : 0;
    const numCols = cardCount > 3 ? 3 : cardCount;
    const numRows = Math.ceil(cardCount / 3);
    const gridRows = genRepeatArray("auto", numRows);
    const gridCols = genRepeatArray("32%", numCols);
    const gridAreas = gridRows.map((_, row) => {
        return gridCols.map((__, col) => {
            return {name: `${col},${row}`, start: [col, row], end: [col, row]};
        })
    }).flat();
    console.log(gridAreas);

    return (
        <Box className={"center"} pad={"medium"} width={"large"} height={"auto"} border={{}}
        >
            <Button style={{width: "32px", height: "32px", position: "absolute", right: "24px"}} color={"white"}
                    plain
                    onClick={() => setAddClickAnim({fill: "#fc7a5b"})}
                    hoverIndicator icon={<AnimatedAdd style={addClickAnim}/>}/>
            <Heading level={"1"} style={{textAlign: "left", fontWeight: "800"}} color={"#fc7a5b"}>Today</Heading>
            {cardCount > 0 ?
                <Grid rows={gridRows}
                      columns={gridCols}
                      areas={gridAreas}
                      gap={"small"}
                >
                    {

                        globalState.userData.data ?
                            globalState.userData.data.courses.map((course: any) => {
                                gridCnt++;
                                return course ?
                                    course.assignments.map((asn: any) => {
                                        return <AssignmentCard
                                            gridArea={`${gridCnt % 3},${Math.floor(gridCnt / 3)}`}
                                            course={course}
                                            assignment={asn}/>
                                    }) : <p>No courses</p>
                            }) : <p>No Data</p>
                    }
                </Grid>
                : <p>No assignments</p>
            }
        </Box>
    );
}

Dashboard.auth = true;
export default Dashboard;
