"use client";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "./confirm-model";
import { Button } from "./ui/button";
import { useRenameModal } from "@/store/use-rename-modal";

interface ActionProps{
    children: React.ReactNode;
    side?: DropdownMenuContentProps["side"];
    sideOffset?: DropdownMenuContentProps["sideOffset"];
    id: string;
    title: string;
}

export const Action = ({children, side, sideOffset, id, title}: ActionProps) => {

    const { onOpen } = useRenameModal();

    const { mutate,pending } = useApiMutation(api.board.remove);

    const onCopyLink = () => {
        navigator.clipboard.writeText(
            `${window.location.origin}/board/${id}`
        )
        .then(() => toast.success("Link copied to clipboard"))
        .catch(() => toast.error("Failed to copy link"));
    }

    const onDelete = () => {
        mutate({id})
        .then(() => toast.success("Board deleted"))
        .catch(() => toast.error("Failed to delete board"));
     }
    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent
            side={side}
            sideOffset={sideOffset}
            className="w-60"
            onClick={(e)=>e.stopPropagation()}
            >   
             <DropdownMenuItem 
             onClick={onCopyLink}
             className="p-3 cursor-pointer">
                    <Link2 className="h-4 w-4 mr-2"/>
                    Copy board link
                </DropdownMenuItem>

                <ConfirmModal 
                disabled={pending}
                onConfirm={onDelete} 
                header="Delete board?"    
                description="This will delete the board and all its contents."
                >
                <Button 
                variant="ghost"
                className="p-3 cursor-pointer w-full justify-start font-normal text-sm">
                    <Trash2 className="h-4 w-4 mr-2"/>
                    Delete
                </Button>
                </ConfirmModal>

                <DropdownMenuSeparator/>
                <DropdownMenuItem 
                onClick ={()=>onOpen(id, title)}
                className="p-3 cursor-pointer">
                    <Pencil className="h-4 w-4 mr-2"/>
                    Rename
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}