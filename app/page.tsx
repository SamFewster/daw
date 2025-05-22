"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Waveform from '@/components/waveform';
import { Button } from '@/components/ui/button';
import { playPause, seekTime, useControls } from '@/components/controls-provider';
import { FastForwardIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const Page = () => {
    const { controls, setControls } = useControls();

    const [audioFiles, setAudioFiles] = useState<File[]>([]);

    useEffect(() => {
        const context = new AudioContext();
        const gainNode = context.createGain();
        gainNode.connect(context.destination);
        setControls(prev => ({ ...prev, context, gainNode }));
        (async () => {
            const response = await axios.get("/sample4.flac", { responseType: "blob" });
            if (response) setAudioFiles([...Array(5).fill("").map(() => (response.data))]);
        })();
    }, [])

    if (typeof document !== "undefined") {
        document.onkeydown = (e) => {
            switch (e.key) {
                case (" "):
                    playPause(setControls);
                    break;
                case (","):
                    seekTime(setControls, -10);
                    break;
                case ("."):
                    seekTime(setControls, +10);
                    break;
                default:
                    console.log(e.key);
            }
        }
    }

    return <div className="w-screen h-screen flex flex-col">
        <div className="w-screen bg-muted/50 flex items-center justify-between p-2">
            <div className="flex flex-col gap-2 items-center jusitfy-center text-center">
                <p className='text-sm'>Zoom</p>
                <Slider value={[controls.zoom]} min={1} max={100} className="w-[200px]" onValueChange={(value) => setControls(prev => ({ ...prev, zoom: value[0] }))} />
            </div>
            <div className="flex gap-2 justify-center items-center">
                <Button variant="outline" size="icon" onKeyDown={(e) => e.preventDefault()} onClick={() => seekTime(setControls, -10)}>
                    <FastForwardIcon className="rotate-180" />
                </Button>
                <Button variant="outline" size="icon" onKeyDown={(e) => e.preventDefault()} onClick={() => playPause(setControls)}>
                    {controls.playing ? <PauseIcon /> : <PlayIcon />}
                </Button>
                <Button variant="outline" size="icon" onKeyDown={(e) => e.preventDefault()} onClick={() => seekTime(setControls, +10)}>
                    <FastForwardIcon />
                </Button>
            </div>
            <div className="flex flex-col gap-2 items-center jusitfy-center text-center">
                <p className='text-sm'>Volume</p>
                <Slider min={-100} max={100} defaultValue={[0]} className="w-[200px]" onValueChange={(value) => {
                    if (controls.gainNode) {
                        controls.gainNode.gain.value = value[0] / 100;
                    }
                }} />
            </div>
        </div>
        <div
            className='w-screen h-screen'
            onDragOver={(e) => { e.preventDefault() }}
            onDragEnter={(e) => { e.preventDefault() }}
            onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) setAudioFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
            }}
        >
            <ScrollArea className='min-w-full overflow-x-visible p-2 flex items-center flex-col text-center min-h-full'>
                <div className="flex flex-col gap-1 w-full h-full">
                    {audioFiles.map((file, i) => (
                        <Waveform audioBlob={file} key={i} />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    </div>
}

export default Page