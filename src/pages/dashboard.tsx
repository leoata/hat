import {getSession, useSession} from "next-auth/react";
import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardBody, CardFooter, CardHeader, Heading, Select, Text, Grid, Clock} from "grommet";
import {getBaseUrl} from "../util/envUtil";
import {useRouter} from "next/router";
import {animated, useSpring} from "react-spring";
import {Add, Refresh} from "grommet-icons";
import {useGlobalState} from "../store";
import {Session} from "next-auth/core/types";
import {User, Assignment, Course} from "@prisma/client";
import AssignmentCard from "../components/AssignmentCard";
import prisma from "../../lib/prisma";
import NewAssignmentModal from "../components/NewAssignmentModal";
import DayAssignments from "../components/DayAssignments";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import InfoModal from "../components/InfoModal";
import {
    deleteAssignment,
    getCourseAndUserData,
    saveAssignmentPriorities,
    saveNewAssignment,
    setComplete
} from "../../lib/apiclient";

function Dashboard() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [globalState, setGlobalState] = useGlobalState();
    const [isLoading, setLoading] = useState(
        !globalState.userData.data || Date.now() - globalState.userData.lastUpdated > 1000 * 60 * 60 * 24);
    const [lastPriorityUpdate, setLastPriorityUpdate] = useState(0);
    const [newAssignmentModalShow, setNewAssignmentModalShow] = React.useState(false);
    const [infoModalShow, setInfoModalShow] = React.useState<any>(undefined);
    const [confirmDeleteModalShow, setConfirmDeleteModalShow] = React.useState<string | undefined>(undefined);
    // id of assignment to delete, undefined otherwise

    if (!session || !session.user || !session.user.email) {
        router.replace("/");
        return null;
    }

    const [priorities, setPriorities] = useState<string[][]>([[], [], []]); // idx=priority, val=[asn ids]
    const postPriority = async (id: string, p: number) => {
        for (let i = 0; i < priorities.length; ++i)
            priorities[i] = priorities[i].filter(x => x !== id);
        priorities[p].push(id);
        if (lastPriorityUpdate - Date.now() > 3000) {
            setLastPriorityUpdate(Date.now());
            await saveAssignmentPriorities(priorities, setPriorities);
        }
    }
    if (window) {
        window.addEventListener("unload", async () => await saveAssignmentPriorities(priorities, setPriorities))
    }

    useEffect(() => {
        // dont bother with super stale data
        if (!globalState.userData.data || Date.now() - globalState.userData.lastUpdated > 1000 * 60 * 60 * 24) // 1 day
            setLoading(true)

        getCourseAndUserData(setGlobalState, globalState, setLoading, router);

        const poller = setInterval(async () => { // TODO: make this work
            await saveAssignmentPriorities(priorities, setPriorities, setLastPriorityUpdate);
        }, 3000);
        return () => {
            clearInterval(poller)
        }
    }, []);


    if (isLoading) return <Heading className={"center"} level={"1"}>Loading...</Heading>
    if (globalState.userData.lastUpdated === 0) return <Heading className={"center"} level={"1"}>No Data found.
        Try logging in again.</Heading>
    let dayOrder: number[] = [];
    if (globalState.userData.data) {
        let allAssignments = globalState.userData.data.courses.map((course: any) => course.assignments).flat();
        let allDays: string[] = allAssignments.map(s => new Date(s.dueDate)).sort((a, b) => a.getTime() - b.getTime())
            .map(d => d.toISOString().slice(0, 10)).filter((item, pos, self) => self.indexOf(item) == pos);
        if (allDays.includes(new Date().toISOString().slice(0, 10)))  // today
            dayOrder.push(floorDate(Date.now()).getTime());

        // overdue
        dayOrder.push(...allDays.filter(d => new Date(d).getTime() < new Date().getTime()).map(d => new Date(d).getTime()));
        // upcoming
        dayOrder.push(...allDays.filter(d => new Date(d).getTime() > new Date().getTime()).map(s => new Date(s).getTime()));
        dayOrder = dayOrder.filter(s => dayOrder.indexOf(s) == dayOrder.lastIndexOf(s));
    }

    return (
        <>
            <Clock style={{
                width: "10rem",
                height: "32px",
                position: "fixed",
                left: "50%",
                marginLeft: "-5rem",
                marginTop: "1rem",
                textAlign: "center",
                zIndex: 999,
            }} type="digital"/>
            <Button style={{
                width: "32px",
                height: "32px",
                position: "fixed",
                right: "24px",
                marginTop: "24px",
                textAlign: "center",
                zIndex: 999,
            }} color={"white"}
                    plain
                    onClick={() => setNewAssignmentModalShow(true)}
                    hoverIndicator icon={<Add/>}/>
            <Button style={{
                width: "32px",
                height: "32px",
                position: "fixed",
                right: "56px",
                marginTop: "24px",
                textAlign: "center",
                zIndex: 999,
            }} color={"white"}
                    plain
                    onClick={() => getCourseAndUserData(setGlobalState, globalState, setLoading, router)}
                    hoverIndicator icon={<Refresh/>}/>
            <Box className={"center"} pad={"medium"} width={"80%"} height={"100%"}
                 style={{overflow: "scroll", maxHeight: "calc(100% - 40px)", top: "calc(50% - 20px)"}}>
                {infoModalShow ?
                    <InfoModal show={infoModalShow} setShow={setInfoModalShow}/> : null
                }
                {newAssignmentModalShow ?
                    <NewAssignmentModal courses={globalState.userData.data ? globalState.userData.data.courses : []}
                                        show={newAssignmentModalShow} setShow={setNewAssignmentModalShow}/> : <></>}
                {confirmDeleteModalShow ?
                    <ConfirmDeleteModal show={confirmDeleteModalShow} setShow={setConfirmDeleteModalShow}
                                        callback={async (id: string | undefined) =>
                                            await deleteAssignment(id as string, setGlobalState, globalState, router)}
                    /> : <></>}

                <DayAssignments key={floorDate(Date.now()).getTime()} postPriority={postPriority}
                                day={[floorDate(Date.now()).getTime()]}
                                setDeleteModalShow={setConfirmDeleteModalShow}
                                setInfoModalShow={setInfoModalShow}
                                setComplete={(id: string) => setComplete(id, setGlobalState, globalState, setLoading, router)}/>
                {
                    dayOrder.filter(d => new Date(d).getTime() < new Date().getTime())
                        .length > 0 ?
                        <DayAssignments key={"overdue"} postPriority={postPriority} overdue
                                        day={[...dayOrder.filter(d => new Date(d).getTime() < new Date().getTime()).map(d => new Date(d).getTime())]}
                                        setDeleteModalShow={setConfirmDeleteModalShow}
                                        setInfoModalShow={setInfoModalShow}
                                        setComplete={(id: string) => setComplete(id, setGlobalState, globalState, setLoading, router)}/> : <></>
                }
                {
                    dayOrder.filter(d => new Date(d).getTime() > new Date().getTime()).map(d => new Date(d).getTime())
                        .filter((day: number) =>
                            globalState.userData.data ?
                            globalState.userData.data.courses.map((course: any) => course.assignments).flat()
                                .filter((asn: any) => !asn.completed)
                                .filter(asn => new Date(day).toISOString().slice(0, 10) ===
                                    new Date(asn.dueDate).toISOString().slice(0, 10)).length : 0 > 0)
                        .map((s: number) => {
                        return <DayAssignments key={s} postPriority={postPriority} day={[s]}
                                               setDeleteModalShow={setConfirmDeleteModalShow}
                                               setInfoModalShow={setInfoModalShow}
                                               setComplete={(id: string) => setComplete(id, setGlobalState, globalState, setLoading, router)}
                        />
                    })
                }
            </Box>
        </>
    );
}

export const floorDate = (date: number) => {
    return new Date(new Date(date).toISOString().slice(0, 10));
};
Dashboard.auth = true;
export default Dashboard;
