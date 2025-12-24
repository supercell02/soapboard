"use client";

import {  ReactNode } from "react";
import { ClientSideSuspense,LiveblocksProvider,RoomProvider } from "@liveblocks/react";

interface RoomProps{
    children:ReactNode
    roomId: string;
    fallback: NonNullable<ReactNode>| null;
}

export const Room =({
    children,
    roomId,
    fallback
}: RoomProps) =>{
    return(
        <LiveblocksProvider publicApiKey={"pk_dev_-H-bo7PDhCpcs2OM_8HgTzgHFCeEhKqtgOmbWzDOx6gzwp_wYPbNWdI4L-6qwwRn"}>
        <RoomProvider id={roomId} initialPresence={{}}>
            <ClientSideSuspense  fallback={fallback}>
                {()=> children}
            </ClientSideSuspense>
        </RoomProvider>
    </LiveblocksProvider>
    )
}
