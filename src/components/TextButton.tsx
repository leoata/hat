import React from 'react';
import {animated, useSpring} from "react-spring";

type Props = {
    text: string;
    onClick: () => void;
    style?: any;
};


const TextButton = (props: Props) => {
    const {text, onClick, style} = props;
    const [textColor, textColorApi] = useSpring(() => ({
        color: '#000000',
        config: {duration: 100, tension: 20}
    }));
    return (
        <animated.p style={{fontFamily: "Butler", fontSize: "2.5rem", fontWeight: "600", ...textColor, lineHeight: "2.5rem",
            ...style
        }}
                    onMouseEnter={() => textColorApi({color: "#bc8da0"})}
                    onMouseLeave={() => textColorApi({color: "#000000"})}>
            <a href={"#"} onClick={onClick}

            >{text}</a>
        </animated.p>
    );
};

export default TextButton;
