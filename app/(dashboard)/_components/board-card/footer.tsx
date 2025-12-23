import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterProps{
    title: string;
    authorLabel: string;
    createdAtLabel: string;
    isFavorite: boolean;
    onClick: () => void;
    disabled: boolean;
}

export const Footer = ({
    title,
    authorLabel,
    createdAtLabel,
    isFavorite,
    onClick,
    disabled,
}: FooterProps) => {
    return (
        <div className="relative bg-white p-3">
            <p className="text-[13px] truncate max-w-[calc(100%-20px)]">
                {title}
                </p>
            <div className="flex items-center gap-x-1">
                <p className="truncate opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-muted-foreground">
                    {authorLabel},{createdAtLabel}
                    </p>
                <button
                 disabled={disabled}
                    className={cn(
                        "opacity-0 group-hover:opacity-100 absolute top-3 right-3 text-muted-foreground transition hover:text-blue-600",
                        disabled && "cursor-not-allowed opacity-75"
                    )}
                    onClick={onClick}>
                <Star
                className={cn(
                    "h-4 w-4",
                    isFavorite && "fill-blue-600 text-blue-600"
                )}
                />
                </button>
            </div>
        </div>
    );
};