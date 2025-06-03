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
class ControlsInterface {
    public setControls: React.Dispatch<React.SetStateAction<ControlsProps>>;
    constructor({ setControls }: ControlsContextProps) {
        this.setControls = setControls;
    }
    public playPause() {
        this.setControls(prev => ({ ...prev, playing: !prev.playing, startedPlayingAt: prev.context!.currentTime }));
    }
    public async seekTime(offset: number) {
        const controls = await this.getControls();
        const seekTo = controls.time + (controls.context!.currentTime - controls.startedPlayingAt) + offset;
        if (seekTo > 0) {
            this.setControls(prev => ({ ...prev, time: seekTo, startedPlayingAt: prev.context!.currentTime }));
        } else this.setControls(prev => ({ ...prev, time: 0 }))
    }
    private async getControls(): Promise<ControlsProps> {
        return new Promise((res) => {
            this.setControls((prev) => {
                res(prev);
                return prev;
            })
        })
    }
}

type ControlsReturnProps = {
    controls: ControlsProps,
    controlsInterface: ControlsInterface
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

export const useControls = (): ControlsReturnProps => {
    const context = useContext(ControlsContext);
    if (!context) {
        throw new Error("useControls must be used within a ControlsProvider");
    }
    return {
        controls: context.controls,
        controlsInterface: new ControlsInterface(context)
    };
}

export default ControlsProvider