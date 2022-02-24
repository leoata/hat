import React from 'react';
import {Box, Layer, Grid} from "grommet";

const InfoModal = ({
                       show, // courses obj
                       setShow
                   }: { show: any, setShow: (s: any) => void, }) => {
    return (
        <Layer
            style={{width: "20rem", height: "25rem", backgroundColor: "#FCF4E1", padding: "2rem 1rem 0rem 1rem"}}
            onEsc={() => setShow(undefined)}
            onClickOutside={() => setShow(undefined)}>
            <h3 style={{textAlign: "center", padding: "8px", fontSize: "32px", marginBottom: "4px"}}>Assignment
                Info</h3>
            <Grid
                rows={["10%", "10%", "10%", "10%", "10%"]}
                columns={["50%", "50%"]}
                gap={"small"}
                areas={[
                    {name: "label1", start: [0, 0], end: [0, 0]},
                    {name: "info1", start: [1, 0], end: [1, 0]},
                    {name: "label2", start: [0, 1], end: [0, 1]},
                    {name: "info2", start: [1, 1], end: [1, 1]},
                    {name: "label3", start: [0, 2], end: [0, 2]},
                    {name: "info3", start: [1, 2], end: [1, 2]},
                    {name: "label4", start: [0, 3], end: [0, 3]},
                    {name: "info4", start: [1, 3], end: [1, 3]},
                    {name: "label5", start: [0, 4], end: [0, 4]},
                    {name: "info5", start: [1, 4], end: [1, 4]},
                ]}
            >
                <InfoEntry grid1={"label1"} grid2={"info1"} label={"Course"}
                           info={show.course.name}/>
                <InfoEntry grid1={"label2"} grid2={"info2"} label={"Name"}
                           info={show.assignment.name}/>
                <InfoEntry grid1={"label3"} grid2={"info3"} label={"Due Date"}
                           info={show.assignment.dueDate.replace("T", " ").slice(0, show.assignment.dueDate.lastIndexOf("."))}/>
                <InfoEntry grid1={"label4"} grid2={"info4"} label={"Test?"}
                           info={show.assignment.isTest ? "Yes" : "No"}/>
                <InfoEntry grid1={"label5"} grid2={"info5"} label={"Priority"}
                           info={show.assignment.priority == 0 ? "Low" : (show.assignment.priority == 1 ? "Medium" : "High")}/>
            </Grid>
        </Layer>
    );
};

const InfoEntry = ({grid1, grid2, label, info}: { grid1: string, grid2: string, label: string, info: string }) => {
    return (
        <>
            <Box gridArea={grid1}>
                <h4 style={{
                    lineHeight: "16px",
                    marginTop: "16px",
                    marginBottom: "16px",
                    textAlign: "right"
                }}>{label}</h4>
            </Box>
            <Box gridArea={grid2}>
                <h4 style={{
                    fontWeight: "400",
                    textAlign: "left",
                    lineHeight: "16px",
                    margin: "16px 0 16px 0"
                }}>{info}</h4>
            </Box>
        </>
    );
}

export default InfoModal;
