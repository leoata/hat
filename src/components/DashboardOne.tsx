import React, {useEffect} from 'react';
import {Anchor, Box, Button, Card, CardBody, CardFooter, CardHeader, Heading, Nav, Text} from "grommet";
import {Home, Notification, ChatOption, Add} from "grommet-icons";
import {getSession, useSession} from "next-auth/react";
import useSwr, {SWRResponse} from 'swr';
import {InferGetServerSidePropsType} from "next";
import {animated, useSpring} from "react-spring";
import {randScholarlyEmoji} from "../util/randEmoji";


const DashboardOne = ({user}: { user: any }) => {
    const AnimatedButton = animated(Button)
    const AnimatedAdd = animated(Add);

    const [addClickAnim, setAddClickAnim] = useSpring(() => ({
        fill: "#000000",
        config: {duration: 200}
    }));

    const [priority, setPriority] = React.useState(0);
    return (
        <Box className={"center"} pad={"medium"} width={"large"} height={"auto"} border={{}}>
            <Button style={{width: "32px", height: "32px", position: "absolute", right: "24px"}} color={"white"} plain
                    onClick={() => setAddClickAnim({fill: "#fc7a5b"})}
                    hoverIndicator icon={<AnimatedAdd style={addClickAnim}/>}/>
            <Heading level={"1"} style={{textAlign: "left", fontWeight: "800"}} color={"#fc7a5b"}>Today</Heading>
            <Card height={"small"} width={"small"}>
                <CardHeader pad="small">
                    <Text style={{fontWeight: "800", width: "100%", textAlign: "left"}}>AP Stats</Text>
                    <p>🔢</p>
                </CardHeader>
                <CardBody pad="small" style={{textAlign: "left"}}>
                    <Text>A "Cool" Phenomenon - W2 Graded Assignment</Text>
                </CardBody>
                <CardFooter pad={{horizontal: "small", vertical: "medium"}}>
                    <AnimatedButton
                        icon={<p>{priority === 0 ? "📚" : (priority === 1 ? "⚠️" : "🔥")}</p>}
                        onClick={() => {
                            setPriority(priority == 2 ? 0 : priority + 1)
                        }}

                        hoverIndicator
                    />
                </CardFooter>
            </Card>
        </Box>
    );
};


export default DashboardOne;
