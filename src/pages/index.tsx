import {GlobalStateProvider, useGlobalState} from "../store";
import {Box, Button, Grommet, Heading, Text, ThemeType} from "grommet";
import {animated, useSpring} from "react-spring";
import TextButton from "../components/TextButton";
import {useRouter} from "next/router";
import {changeRoute} from "../util/routeUtil";
import { useSession, signIn, signOut } from "next-auth/react"


export default function Index() {
    const AnimatedHeading = animated(Heading);
    const AnimatedBox = animated(Box);
    const router = useRouter();

    const [loginButtonAnim, loginButtonAnimApi] = useSpring(() => ({
        opacity: 0,
        delay: 400,
    }));
    const [slideUpAnim, slideUpAnimApi] = useSpring(() => ({
        paddingTop: 100,
        config: {tension: 100}
    }));
    const fadeIn = useSpring({
        from: {opacity: 0},
        to: {opacity: 1},
        onRest: () => {
            loginButtonAnimApi({opacity: 1, delay: 400});
            slideUpAnimApi({paddingTop: 0})
        },
        delay: 500,
    });

    return (
        <>
            <div className={"center"} style={{height: "16rem"}}>
                <AnimatedBox direction={"column"} style={{
                    ...fadeIn,
                    ...slideUpAnim,
                    width: "50rem",
                    height: "100%",
                }}>
                    <AnimatedHeading level="1"
                                     style={{fontSize: "10rem", height: "50%",
                                         letterSpacing: 0, pointerEvents:"none", color: "#fc7a5b"}}
                                     margin={"xsmall"}>hat</AnimatedHeading>
                </AnimatedBox>
            </div>
            <animated.div className={"center"} style={{marginTop: "2rem", ...loginButtonAnim}}>
                <TextButton style={{float: "left", marginRight: "2rem"}} text={"Sign Up"} onClick={() => signIn()}/>
                <TextButton style={{float: "right", marginLeft: "2rem"}} text={"Log In"} onClick={() => signIn()}/>
            </animated.div>
        </>
    )
}
