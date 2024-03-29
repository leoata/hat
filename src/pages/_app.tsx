import '../styles/globals.css'
import '../styles/fonts.css'
import type {AppProps} from 'next/app'
import {Head} from "next/document";
import React, {useEffect} from 'react';
import {GlobalStateProvider, useGlobalState} from '../store';
import {Grommet, ThemeType} from "grommet";
import {animated, Transition, useSpring, useTransition} from 'react-spring';
import {useRouter} from "next/router";
import TextButton from "../components/TextButton";
import {SessionContextValue, SessionProvider, signIn, useSession} from "next-auth/react"
import {useForceUpdate} from "@react-spring/shared";

const grommet: ThemeType = {
    global: {
        focus: {
            border: {
                color: '#C08497',
            },
        },
        colors: {
            brand: "#C08497",
            navyBlue: "#0d3b66",
            beige: "#faf0ca",
            yellow: "#f4d35e",
            orange: "#ee964b",
            red: "#f95738",
            black: "#000000",
            darkGreen: "#00684A",
            lightGreen: "#00ED64",
            primary: "#fc7a5b",
            secondary: "#475b5a",
            border: "#C08497"
        },
        font: {
            family: "Natrix Sans",
            size: "18px",
            weight: "400"
        },
    },
    heading: {
        level: {
            1: {
                font: {
                    family: "Butler",
                    size: "30rem ",
                    color: "#bc8da0",
                    weight: "300"
                }
            },
            2: {
                font: {
                    family: "Sofia Pro Bold",
                    size: "32px",
                    weight: "800",
                }
            },
            3: {
                font: {
                    family: "Euclid Circular Regular",
                    size: "14px",
                    weight: "400"
                }
            },
            4: {
                font: {
                    family: "Sofia Pro Regular",
                    size: "16px",
                    weight: "400"
                }
            },
            5: {
                font: {
                    family: "Sofia Pro Light",
                    size: "16px",
                    weight: "200"
                }
            }
        }
    }
};


function ProtectedRoute({children}: { children: JSX.Element }): JSX.Element {
    const {data: session, status} = useSession()
    const isUser = !!session?.user
    React.useEffect(() => {
        if (status === "loading") return
        if (!isUser) signIn()
    }, [isUser, status])

    if (isUser) {
        return children
    }

    // Session is being fetched, or no user.
    // If no user, useEffect() will redirect.
    return <div>Loading...</div> // TODO: better loading screen
}

function AppContent({
                        appProps: {Component, pageProps, router},
                        session
                    }: { appProps: AppProps, session: SessionContextValue<boolean> }) {
    const [globalState, setGlobalState] = useGlobalState();

    const [fade, fadeApi] = useSpring(() => ({
        from: {opacity: 0},
        to: {opacity: 1},
        config: {duration: 750}
    }));

    useEffect(() => {
        const routeChangeComplete = (url: any, {shallow}: any) => {
            fadeApi({reset: true})
            fadeApi({opacity: 1});
        };

        router.events.on('routeChangeComplete', routeChangeComplete);

        return () => {
            router.events.off('routeChangeComplete', routeChangeComplete);
        }
    }, []);

    return <>
        <title>hat - homework assignment tracker</title>
        <TextButton style={{position: "absolute", margin: "20px"}} text={"h"}
                    onClick={() => {
                        if (router.pathname !== "/")
                            router.push("/")
                    }}/>
        <animated.div style={fade}>

            {    // @ts-ignore
                Component.auth ? (
                    <ProtectedRoute>
                        <Component {...pageProps} />
                    </ProtectedRoute>
                ) : (
                    <Component {...pageProps} />
                )}
        </animated.div>
    </>;
}

function MyApp({Component, pageProps: {session, ...pageProps}, router}: AppProps) {


    return <>
        <GlobalStateProvider>
            <SessionProvider session={session}>
                <Grommet theme={grommet}>
                    <AppContent appProps={{pageProps, Component, router}} session={session}/>
                </Grommet>
            </SessionProvider>
        </GlobalStateProvider>

    </>
}


export default MyApp;
