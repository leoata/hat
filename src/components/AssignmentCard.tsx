import React, {useState} from 'react';
import {Box, Button, Grid, Text} from "grommet";

type AssignmentCardProps = {
    assignment: any,
    course: any,
    gridArea: string
}

const AssignmentCard = (props: AssignmentCardProps) => {
    const {course, assignment, gridArea} = props;
    const [priority, setPriority] = useState(0);
    if (process.browser) {
        window.onbeforeunload = async() => {
            await fetch(`/api/assignment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({priority: priority, id: assignment.id})
            });
        }
    }
    return (
        <Box width={"100%"} key={course.name + "|" + assignment.id}
             round={"small"} elevation={"small"} background={"#F9E9C4"}>
            <Grid
                rows={['32px', 'xsmall', '32px']} columns={["auto"]}
                areas={[
                    {name: 'header', start: [0, 0], end: [0, 0]},
                    {name: 'body', start: [0, 1], end: [0, 1]},
                    {name: 'footer', start: [0, 2], end: [0, 2]}
                ]}
            >
                <Box gridArea={"header"} style={{padding: "7px"}}>
                    <Text style={{
                        fontWeight: "800",
                        width: "calc(100% - 32px)",
                        textAlign: "left",
                        display: "inline-block"
                    }}>{course.name}</Text>
                    {/*<p style={{width: "24px", margin: 0, display: "inline-block"}}>{course.emoji ?? "🔢"}</p>*/}
                </Box>
                <Box gridArea={"body"} style={{
                    textAlign: "left",
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: "50px",
                    padding: "7px"
                }}>
                    <Text>{assignment.name}</Text>
                </Box>
                <Box gridArea={"footer"} style={{minHeight: "32px", height: "32px", padding: "0 10px 0 10px"}}
                     background={"#FCF4E1"} round={{size: "small", corner: "bottom"}}>
                    <Button style={{height: "32px", width: "32px", padding: 0}}
                                    icon={
                                        <p>{priority === 0 ? "📚" : (priority === 1 ? "⚠️" : "🔥")}</p>}
                                    onClick={() => {
                                        setPriority(priority == 2 ? 0 : priority + 1);
                                    }}
                                    hoverIndicator
                    />


                </Box>
            </Grid>
        </Box>
    );
};

export default AssignmentCard;
