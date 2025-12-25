"use client";

import { Cursor } from "@/app/board/[boardId]/_components/cursor";
import { useOthersConnectionIds } from "@liveblocks/react";
import { memo } from "react";

const Cursors = () =>{
    const ids = useOthersConnectionIds();

    return (
        <>
        {ids.map((connectionId) =>(
            <Cursor
                key={connectionId}
                connectionId={connectionId}
            />
        ))}
        </>
    )
}

export const CursorsPresence =memo(() =>{
    return (
        <>
        <Cursors/>
        </>
    );
});

CursorsPresence.displayName = "CursorsPresence";