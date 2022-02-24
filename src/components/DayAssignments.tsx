import React from 'react';
import {Grid, Heading} from "grommet";
import AssignmentCard from "./AssignmentCard";
import {useGlobalState} from "../store";
import {floorDate} from "../pages/dashboard";

type DayAssignmentsProps = {
    postPriority: any,
    day: number[], // millis since last epoch
    setDeleteModalShow: any,
    setInfoModalShow: any,
    overdue?: boolean,
    setComplete: any,
}
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const dateToString = (date: number): string => {
    if (date === floorDate(Date.now()).getTime())
        return "Today";
    const d = new Date(date);
    const isTomorrow = d.getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 2 && ((new Date().getDay() + 1) % 6 === d.getDay())
    if (isTomorrow)
        return "Tomorrow";
    const day = weekdays[d.getDay()];
    const isFarAway = date - new Date().getTime() > 1000 * 60 * 60 * 24 * 7;
    if (!isFarAway)
        if (new Date().getDay() > d.getDay())
            return day;

    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}, ${month} ${d.getDate() + 1}, ${year}`;
};

const DayAssignments = ({
                            postPriority,
                            day,
                            setDeleteModalShow,
                            setInfoModalShow,
                            overdue,
                            setComplete
                        }: DayAssignmentsProps) => {
    const [globalState, setGlobalState] = useGlobalState();
    const genRepeatArray = (key: string, cnt: number) => Array.from(Array(cnt).keys()).map(x => key);

    let gridCnt = -1;
    let cardCount;
    cardCount = globalState.userData.data ?
        globalState.userData.data.courses.map((course: any) => course.assignments).flat()
            .filter((asn: any) => !asn.completed)
            .filter(asn => day.map(s => new Date(s).toISOString().slice(0, 10))
                .includes(new Date(asn.dueDate).toISOString().slice(0, 10))).length : 0;
    const numCols = cardCount > 4 ? 4 : cardCount;
    const numRows = Math.ceil(cardCount / 3);
    const gridRows = genRepeatArray("10rem", numRows);
    const gridCols = genRepeatArray("22%", numCols);
    const gridAreas = gridRows.map((_, row) => {
        return gridCols.map((__, col) => {
            return {name: `${col},${row}`, start: [col, row], end: [col, row]};
        })
    }).flat();
    return (
        <div>
            <Heading level={"1"} style={{textAlign: "left", fontWeight: "800"}} color={"#fc7a5b"}>
                {overdue ? "Overdue" : dateToString(day[0])}
            </Heading>
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
                                let asnList;
                                asnList = course.assignments.filter((asn: any) => day.map(s => new Date(s).toISOString().slice(0, 10))
                                    .includes(new Date(asn.dueDate).toISOString().slice(0, 10)));
                                return course ?
                                    asnList
                                        .map((asn: any) => {
                                            return <AssignmentCard
                                                setComplete={setComplete}
                                                setDeleteModalShow={setDeleteModalShow}
                                                setInfoModalShow={setInfoModalShow}
                                                key={asn.id}
                                                gridArea={`${gridCnt % 4},${Math.floor(gridCnt / 4)}`}
                                                course={course}
                                                assignment={asn}
                                                postPriority={postPriority}
                                            />
                                        }) : <p>No courses</p>
                            }) : <p>No Data</p>
                    }
                </Grid>
                : (day[0] === floorDate(Date.now()).getTime() ? <p>🎉 Woohoo! No assignments for today!</p> : null)
            }
        </div>
    );
};

export default DayAssignments;
