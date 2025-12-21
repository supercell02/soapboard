import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col gap-y-2">
      <div>
      This is a screen for authenticated users.
      </div>
      <div>
        <UserButton/>
      </div>
    </div>
  );
}
