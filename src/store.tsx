import { useState } from 'react';
import {createContainer} from "react-tracked";
import {useSpring} from "react-spring";

interface GlobalState {
    position: number,
}

const initialState: GlobalState = {
    position: 0,
}


const useMyState = () => useState(initialState);

export const {
    Provider: GlobalStateProvider,
    useTracked: useGlobalState,
} = createContainer(useMyState);
