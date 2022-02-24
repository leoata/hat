import React, {useState} from 'react';
import {Box, Button, Grid, Text} from "grommet";
import {Trash} from "grommet-icons";
import {animated, config, useSpring} from "react-spring";
import {assign} from "next/dist/next-server/lib/router/utils/querystring";

type AssignmentCardProps = {
    assignment: any,
    course: any,
    gridArea: string,
    postPriority: Function,
    setDeleteModalShow: Function,
    setInfoModalShow: Function,
    setComplete: Function
}

const AssignmentCard = (props: AssignmentCardProps) => {
    const {course, assignment, gridArea, postPriority, setDeleteModalShow, setInfoModalShow, setComplete} = props;
    const [priority, setPriority] = useState(assignment.priority);
    const [isHovering, setIsHovering] = useState(false);
    const dueDate = new Date(assignment.dueDate).getHours() + ":" + new Date(assignment.dueDate).getMinutes();
    const AnimatedBox = animated(Box);
    const AnimatedText = animated(Text);
    const AnimatedGrid = animated(Grid);

    const [blurAnim, setBlurAnim] = useSpring(() => {
        return {
            filter: "blur(0px)",
            config: {duration: 100},
        }
    });
    const [showCompleteAnim, setShowCompleteAnim] = useSpring(() => {
        return {
            opacity: 0,
            config: {delay: 200, duration: 100},
        }
    });
    const [completeTextFadeIn, setCompleteTextFadeIn] = useSpring(() => {
        return {
            opacity: 0,
            config: {delay: 200, duration: 100},
        }
    });
    const blurEnter = () => {
        setBlurAnim({
            filter: "blur(2px)",
        })
        setCompleteTextFadeIn({
            opacity: 1,
        })
        setIsHovering(true);
    };
    const blurLeave = () => {
        setBlurAnim({
            filter: "blur(0px)",
            config: {duration: 100},
        })
        setCompleteTextFadeIn({
            opacity: 0,
        })
        setIsHovering(false);
    };
    return (
        <AnimatedBox width={"100%"} key={course.name + "|" + assignment.id}
                     round={"small"} elevation={"small"} background={"#F9E9C4"}
                     style={{position: "relative", cursor: isHovering ? "pointer" : "default"}}
                     gridArea={gridArea}
                     onClick={() => isHovering ? setComplete(assignment.id) : null}
        >
            <AnimatedText style={{
                color: "gray", fontWeight: "600", width: "16rem", textAlign: "center", position: "absolute",
                top: "calc(50% - 12px)", left: "calc(50% - 8rem)", pointerEvents: "none",
                ...completeTextFadeIn
            }}>
                 Click to set as complete ✅
            </AnimatedText>
            <AnimatedGrid
                rows={['32px', 'xsmall', '32px']} columns={["auto"]}
                areas={[
                    {name: 'header', start: [0, 0], end: [0, 0]},
                    {name: 'body', start: [0, 1], end: [0, 1]},
                    {name: 'footer', start: [0, 2], end: [0, 2]}
                ]}
                style={blurAnim}
            >
                <AnimatedBox gridArea={"header"} style={{padding: "7px", display: "inline-block"}}
                             onMouseEnter={blurEnter} onMouseLeave={blurLeave}>
                    <Text style={{
                        fontWeight: "800",
                        width: "50%",
                        float: "left",
                        textAlign: "left",
                        display: "inline-block",
                    }}>{course.name}</Text>
                    <Text style={{
                        fontWeight: "800",
                        width: "50%",
                        textAlign: "right",
                        display: "inline-block",
                        color: "#f95738"
                    }}>
                        {dueDate}
                    </Text>
                    {/*<p style={{width: "24px", margin: 0, display: "inline-block"}}>{course.emoji ?? "🔢"}</p>*/}
                </AnimatedBox>
                <AnimatedBox gridArea={"body"} style={{
                    textAlign: "left",
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: "100%",
                    padding: "7px"
                }} onMouseEnter={blurEnter} onMouseLeave={blurLeave}>
                    <Text>{assignment.name}</Text>
                </AnimatedBox>
                <Box gridArea={"footer"} style={{
                    minHeight: "32px", height: "32px", width: "100%",
                    padding: "0 10px 0 10px", display: "inline-block"
                }}
                     background={"#FCF4E1"} round={{size: "small", corner: "bottom"}}>
                    <Button style={{height: "32px", width: "32px", padding: 0}}
                            icon={<p style={{margin: 0}}>{priority === 0 ? "📚" : (priority === 1 ? "⚠️" : "🔥")}</p>}
                            onClick={async () => {
                                let p = priority == 2 ? 0 : priority + 1;
                                setPriority(p);
                                await postPriority(assignment.id, p);
                            }}
                            hoverIndicator
                    />
                    <div style={{width: "calc(100% - 96px)", margin: 0, padding: 0, display: "inline-block"}}/>
                    <Button style={{width: "32px", height: "32px", padding: 0}}
                            onClick={async () => setInfoModalShow({assignment, course})}
                            icon={<p style={{textAlign: "center", padding: 0}}>ℹ️</p>}
                            hoverIndicator
                    />
                    <Button style={{width: "32px", height: "32px", padding: 0}}
                            onClick={async () => setDeleteModalShow(assignment.id)}
                            icon={<p style={{textAlign: "center", padding: 0}}>🗑️</p>}
                            hoverIndicator
                    />
                </Box>
            </AnimatedGrid>
        </AnimatedBox>
    );
};


export default AssignmentCard;
