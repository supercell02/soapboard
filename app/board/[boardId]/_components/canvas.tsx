"use client";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { useSelf } from "@liveblocks/react/suspense";

interface CanvasProps{
    boardId: string;
};

export const Canvas = ( { boardId } : CanvasProps ) => {
    const { name,picture } = useSelf((me) => me.info);
    console.log(name,picture);


    return (
        <main className="h-full w-full relative bg-neutral-100 touch-none">
            <Info/>
            <Participants/>
            <Toolbar/>
        </main>
    );
};