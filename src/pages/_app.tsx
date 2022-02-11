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
import {UserProvider, useUser} from "@auth0/nextjs-auth0";

const grommet: ThemeType = {
    global: {
        colors: {
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

function protectedUrl(pathname: string): boolean {
    return pathname.startsWith("/user")

}

function AppContent({Component, pageProps, router}: AppProps) {
    const {user, error, isLoading} = useUser();
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    if (!user && protectedUrl(router.pathname)) {
        router.push('/api/auth/login');
        return null;
    }
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
    }, [])
    return <>
        <title>hat - homework assignment tracker</title>
        <TextButton style={{position: "absolute", margin: "20px"}} text={"h"}
                    onClick={() => {
                        if (router.pathname !== "/")
                            router.push("/")
                    }}/>
        <animated.div style={fade}>
            <Component {...pageProps} />
        </animated.div>
    </>
}

function MyApp({Component, pageProps, router}: AppProps) {

    return <>
        <GlobalStateProvider>
            <UserProvider>
                <Grommet theme={grommet}>
                    <AppContent pageProps={pageProps} Component={Component} router={router}/>
                </Grommet>
            </UserProvider>
        </GlobalStateProvider>

    </>
}


export default MyApp;
