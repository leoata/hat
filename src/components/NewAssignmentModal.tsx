import React, {useEffect} from 'react';
import {Button, Layer, Select, Text, TextInput, Grid, Box, DateInput, RadioButton, CheckBox} from "grommet";
import {Close} from "grommet-icons";
import {is} from "@babel/types/lib/index-legacy";
import {floorDate} from "../pages/dashboard";
import {saveNewAssignment, saveNewCourse} from "../../lib/apiclient";
import {useGlobalState} from "../store";
import {useRouter} from "next/router";

enum CoursetInputValidationResult {
    COURSE_NAME_EMPTY,
    SUBJECT_EMPTY,
    VALID
}

enum AssignmentInputValidationResult {
    DUE_DATE_EMPTY,
    DUE_DATE_NOT_A_DATE,
    DUE_DATE_IN_PAST,
    COURSE_NAME_EMPTY,
    ASSIGNMENT_NAME_TOO_SHORT,
    VALID
}

type NewAssignmentModalProps = {
    show: boolean,
    setShow: (s: boolean) => void,
    courses: any,
    setSubsection?: any,
}

// prompt for course or assignment in future

const NewAssignmentModal = ({
                                show,
                                setShow,
                                courses,
                            }: NewAssignmentModalProps) => {
    const [subSection, setSubSection] = React.useState("");

    return (
        <Layer
            style={{width: "30rem", height: "25rem", backgroundColor: "#FCF4E1", padding: "1rem"}}
            onEsc={() => setShow(false)}
            onClickOutside={() => setShow(false)}>
            <Button style={{position: "absolute", top: 0, right: 0, padding: "8px"}} icon={<Close/>}
                    onClick={() => setShow(false)}/>
            {subSection === "" ?
                <SelectionSection setSubSection={setSubSection}/> :
                (subSection === "course" ?
                    <CourseSelectionSection show={show} setShow={setShow} courses={courses} setSubsection={setSubSection}/> :
                    <AssignmentSelectionSection show={show} setShow={setShow} courses={courses} setSubsection={setSubSection}/>)
            }
        </Layer>
    );
};

const SelectionSection = ({setSubSection}: any) => {

    return (
        <>
            <h3 style={{textAlign: "center", padding: "8px", fontSize: "32px", marginBottom: "4px"}}>Would you like to
                create an Assignment or Course?</h3>
            <div style={{
                margin: 0,
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "40%",
                msTransform: "translate(-50%, 0%)",
                transform: "translate(-50%, 0%)",
            }}>
                <div style={{width: "100%"}}>
                    <Button onClick={() => setSubSection("assignment")} style={{float: "left"}}
                            icon={<Text
                                style={{textAlign: "center", fontWeight: "600", color: "#dd614a"}}>Assignment</Text>}/>
                    <Button onClick={async () => setSubSection("course")} style={{float: "right"}}
                            icon={<Text
                                style={{textAlign: "center", fontWeight: "600", color: "#dd614a"}}>Course</Text>}/>
                </div>
            </div>
        </>
    )
}

const CourseSelectionSection = ({show, setShow, courses, setSubsection}: NewAssignmentModalProps) => {
    // need to ask for name and subject. optionally teacher, description, emoji
    const [courseName, setCourseName] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [teacher, setTeacher] = React.useState("");
    const [errorText, setErrorText] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [emoji, setEmoji] = React.useState("");
    const [inputValid, setInputValid] = React.useState<CoursetInputValidationResult>(CoursetInputValidationResult.VALID);

    useEffect(() => {
        setInputValid(computeInputValid());
    }, [courseName, subject]);

    const computeInputValid = (): CoursetInputValidationResult => {
        if (courseName === '')
            return CoursetInputValidationResult.COURSE_NAME_EMPTY;
        if (subject === '')
            return CoursetInputValidationResult.SUBJECT_EMPTY;
        return CoursetInputValidationResult.VALID;
    }

    return (
        <>
            <a style={{fontWeight: "200", color: "#dd614a",
                position: "absolute", fontSize: "12px", top: -2, left: "50%", transform: "translateX(-50%)"}}
               href={"#"}
               onClick={() => setSubsection("assignment")}>
                Click here to create an assignment instead
            </a>
            <h3 style={{textAlign: "center", padding: "8px", fontSize: "32px", marginBottom: "4px"}}>New Course</h3>
            <Text style={{textAlign: "center", padding: "8px", fontSize: "16px", color: "red"}}>{errorText}</Text>
            <Grid
                rows={["xxsmall", "xxsmall", "xxsmall", "xxsmall"]}
                columns={["20%", "75%"]}
                gap={"small"}
                areas={[
                    {name: "nameLabel", start: [0, 0], end: [0, 0]},
                    {name: "nameInput", start: [1, 0], end: [1, 0]},
                    {name: "subjectLabel", start: [0, 1], end: [0, 1]},
                    {name: "subjectInput", start: [1, 1], end: [1, 1]},
                    {name: "descriptionLabel", start: [0, 2], end: [0, 2]},
                    {name: "descriptionInput", start: [1, 2], end: [1, 2]},
                    {name: "teacherLabel", start: [0, 3], end: [0, 3]},
                    {name: "teacherInput", start: [1, 3], end: [1, 3]},
                ]}>
                <Box gridArea={"nameLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Name:</h4>
                </Box>
                <Box gridArea={"nameInput"}>
                    <TextInput style={{fontWeight: "400"}}
                               color={"#fc7a5b"}
                               onChange={(val) => setCourseName(val.target.value)}
                               value={courseName}/>
                </Box>
                <Box gridArea={"subjectLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Subject:</h4>
                </Box>
                <Box gridArea={"subjectInput"}>
                    <TextInput style={{fontWeight: "400"}}
                               color={"#fc7a5b"}
                               onChange={(val) => setSubject(val.target.value)}
                               value={subject}/>
                </Box>

                <Box gridArea={"descriptionLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Description:</h4>
                </Box>
                <Box gridArea={"descriptionInput"}>
                    <TextInput style={{fontWeight: "400"}}
                               color={"#fc7a5b"}
                               onChange={(val) => setDescription(val.target.value)}
                               value={description}/>
                </Box>

                <Box gridArea={"teacherLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Teacher:</h4>
                </Box>
                <Box gridArea={"teacherInput"}>
                    <TextInput style={{fontWeight: "400"}}
                               color={"#fc7a5b"}
                               onChange={(val) => setTeacher(val.target.value)}
                               value={teacher}/>
                </Box>
            </Grid>
            <div style={{width: "100%", height: "100%", marginTop: "15px", padding: "5px", position: "relative"}}>
                <div style={{
                    margin: 0,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    msTransform: "translate(-50%, -50%)",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Button style={{textAlign: "center"}} onClick={async () => {
                        if (inputValid != CoursetInputValidationResult.VALID) {
                            setErrorText(CoursetInputValidationResult[inputValid]
                                .toString().toLowerCase().replaceAll("_", " ")
                                .replace(/^\w/, c => c.toUpperCase()));
                            return;
                        }
                        await saveNewCourse(courseName, subject, description, teacher);
                        setShow(false);

                    }} plain>
                        Create {inputValid == CoursetInputValidationResult.VALID ? "✅" : "❌"}
                    </Button>
                </div>
            </div>
        </>
    )
}

const AssignmentSelectionSection = ({show, setShow, courses, setSubsection}: NewAssignmentModalProps) => {
    const [courseValue, setCourseValue] = React.useState(undefined);
    const [nameValue, setNameValue] = React.useState('');
    const [dateValue, setDateValue] = React.useState(new Date(Date.now()).toISOString());
    const [inputValid, setInputValid] = React.useState(AssignmentInputValidationResult.VALID);
    const [isTestValue, setIsTestValue] = React.useState(false);
    const [errorText, setErrorText] = React.useState('');
    const [globalState, setGlobalState] = useGlobalState();
    const router = useRouter();

    useEffect(() => {
        setInputValid(computeInputValid());
    }, [courseValue, nameValue, dateValue]);

    const computeInputValid = (): AssignmentInputValidationResult => {
        if (nameValue.length < 3)
            return AssignmentInputValidationResult.ASSIGNMENT_NAME_TOO_SHORT;
        // @ts-ignore
        if (courseValue === undefined || courseValue === null || courseValue.length == 0)
            return AssignmentInputValidationResult.COURSE_NAME_EMPTY;
        if (dateValue === '')
            return AssignmentInputValidationResult.DUE_DATE_EMPTY;
        if (isNaN(Date.parse(dateValue)))
            return AssignmentInputValidationResult.DUE_DATE_NOT_A_DATE;
        if (Date.parse(dateValue) < floorDate(Date.now()).getTime())
            return AssignmentInputValidationResult.DUE_DATE_IN_PAST;
        return AssignmentInputValidationResult.VALID;
    }

    return (
        <>
            <a style={{fontWeight: "200", color: "#dd614a",
                position: "absolute", fontSize: "12px", top: -2, left: "50%", transform: "translateX(-50%)"}}
               href={"#"}
               onClick={() => setSubsection("course")}>
                Click here to create a course instead
            </a>
            <h3 style={{textAlign: "center", padding: "8px", fontSize: "32px", marginBottom: "4px"}}>New Assignment</h3>
            <Text style={{textAlign: "center", padding: "8px", fontSize: "16px", color: "red"}}>{errorText}</Text>
            <Grid
                rows={["xxsmall", "xxsmall", "xxsmall", "xxsmall"]}
                columns={["20%", "75%"]}
                gap={"small"}
                areas={[
                    {name: "courseLabel", start: [0, 0], end: [0, 0]},
                    {name: "courseInput", start: [1, 0], end: [1, 0]},
                    {name: "nameLabel", start: [0, 1], end: [0, 1]},
                    {name: "nameInput", start: [1, 1], end: [1, 1]},
                    {name: "dueDateLabel", start: [0, 2], end: [0, 2]},
                    {name: "dueDateInput", start: [1, 2], end: [1, 2]},
                    {name: "isTestLabel", start: [0, 3], end: [0, 3]},
                    {name: "isTestInput", start: [1, 3], end: [1, 3]},
                ]}>
                <Box gridArea={"courseLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Course:</h4>
                </Box>
                <Select
                    gridArea={"courseInput"}
                    options={courses}
                    style={{fontWeight: "400"}}
                    value={courseValue}
                    labelKey={"name"}
                    onChange={({option}) => setCourseValue(option)}
                />
                <Box gridArea={"nameLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Name:</h4>
                </Box>
                <Box gridArea={"nameInput"}>
                    <TextInput style={{fontWeight: "400"}}
                               color={"#fc7a5b"}
                               onChange={(val) => setNameValue(val.target.value)}
                               value={nameValue}/>
                </Box>

                <Box gridArea={"dueDateLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Due Date:</h4>
                </Box>
                <Box gridArea={"dueDateInput"}>
                    <DateInput
                        format="mm/dd/yyyy"
                        value={dateValue}
                        calendarProps={{
                            bounds: [new Date().toISOString().slice(0, 10), new Date(9999999999999).toISOString().slice(0, 10)],
                            daysOfWeek: true,
                            disabled: [new Date(9999999999999).toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)],
                        }}

                        onChange={({value}) => {
                            if (typeof value == "string")
                                setDateValue(value)
                        }}
                        defaultValue={new Date(Date.now() + (1000 * 60 * 60 * 24 * 3)).toISOString()}
                    />
                </Box>
                <Box gridArea={"isTestLabel"}>
                    <h4 style={{
                        lineHeight: "16px",
                        marginTop: "16px",
                        marginBottom: "16px"
                    }}>Test?:</h4>
                </Box>
                <Box gridArea={"isTestInput"}>
                    <CheckBox
                        style={{marginTop: "12px"}}
                        checked={isTestValue}
                        onChange={(e) => setIsTestValue(e.target.checked)}
                    />
                </Box>
            </Grid>
            <div style={{width: "100%", height: "100%", marginTop: "15px", padding: "5px", position: "relative"}}>
                <div style={{
                    margin: 0,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    msTransform: "translate(-50%, -50%)",
                    transform: "translate(-50%, -50%)",
                }}>
                    <Button style={{textAlign: "center"}} onClick={async () => {
                        if (inputValid != AssignmentInputValidationResult.VALID) {
                            setErrorText(AssignmentInputValidationResult[inputValid]
                                .toString().toLowerCase().replaceAll("_", " ")
                                .replace(/^\w/, c => c.toUpperCase()));
                            return;
                        }
                        await saveNewAssignment(setGlobalState, globalState, () => null, router,
                            courseValue, nameValue, isTestValue, dateValue);
                        setShow(false);

                    }} plain>
                        Create {inputValid == AssignmentInputValidationResult.VALID ? "✅" : "❌"}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default NewAssignmentModal;
