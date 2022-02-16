import {useState} from 'react';
import {createContainer} from "react-tracked";
import {useSpring} from "react-spring";
import {SessionContextValue} from "next-auth/react";
import {Course, User} from '@prisma/client';

interface GlobalState {
    position: number,
    userData: {
        lastUpdated: number,
        data: { user: User, courses: Course[]  } | null
    }
}

const initialState: GlobalState = {
    position: 0,
    userData: {
        lastUpdated: 0,
        data: null,
    }
}


const useMyState = () => useState(initialState);

export const {
    Provider: GlobalStateProvider,
    useTracked: useGlobalState,
} = createContainer(useMyState);
