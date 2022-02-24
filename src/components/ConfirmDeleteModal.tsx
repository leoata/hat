import React, {CSSProperties} from 'react';
import {Button, Layer, Text} from "grommet";

const ConfirmDeleteModal = ({
                                show,
                                setShow,
                                callback
                            }: { show: string | undefined, setShow: (s: string | undefined) => void, callback: (id: string | undefined) => void }) => {
    return (
        <Layer
            style={{width: "16rem", height: "8rem", backgroundColor: "#FCF4E1", padding: "2rem 1rem 0rem 1rem"}}
            onEsc={() => setShow(undefined)}
            onClickOutside={() => setShow(undefined)}>
            <Text style={{textAlign: "center", width: "100%"}}> Are you sure you want to delete this assignment?</Text>
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
                    <Button onClick={() => setShow(undefined)} style={{width: "48px", float: "left"}}
                            icon={<p style={{textAlign: "center"}}>❌</p>}/>
                    <Button onClick={async () => {
                        setShow(undefined)
                        await callback(show)
                    }} style={{width: "48px", float: "right"}}
                            icon={<p style={{textAlign: "center"}}>🗑</p>}/>
                </div>
            </div>
        </Layer>
    );
};

export default ConfirmDeleteModal;
