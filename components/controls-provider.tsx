"use client";
import React, { useContext, createContext, useState } from 'react'

type ControlsProps = {
    playing: boolean;
    time: number;
    zoom: number;
    volume: number;
    context: null | AudioContext;
    gainNode: null | GainNode;
    startedPlayingAt: number;
};

type ControlsContextProps = {
    controls: ControlsProps,
    setControls: React.Dispatch<React.SetStateAction<ControlsProps>>
}

const ControlsContext = createContext<ControlsContextProps | undefined>(undefined);


const ControlsProvider = ({ children }: { children: React.ReactNode }) => {
    const [controls, setControls] = useState({
        playing: false,
        time: 0,
        zoom: 50,
        volume: 100,
        context: null as null | AudioContext,
        gainNode: null as null | GainNode,
        startedPlayingAt: 0
    });
    return (
        <ControlsContext.Provider value={{ controls, setControls }}>
            {children}
        </ControlsContext.Provider>
    )
}

export const useControls = (): ControlsContextProps => {
    const context = useContext(ControlsContext);
    if (!context) {
        throw new Error("useControls must be used within a ControlsProvider");
    }
    return useContext(ControlsContext) as ControlsContextProps;
}

export const playPause = (setControls: React.Dispatch<React.SetStateAction<ControlsProps>>) => {
    setControls(prev => ({ ...prev, playing: !prev.playing, startedPlayingAt: prev.context!.currentTime }));
}

export const seekTime = (setControls: React.Dispatch<React.SetStateAction<ControlsProps>>, offset: number) => {
    setControls(prev => ({ ...prev, time: prev.time + (prev.context!.currentTime - prev.startedPlayingAt) + offset, startedPlayingAt: prev.context!.currentTime }));
}

export default ControlsProvider