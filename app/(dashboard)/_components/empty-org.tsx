import Image from "next/image";
import { CreateOrganization } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export const EmptyOrg = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
       src="/element.svg"
        alt="Empty"
        width={200}
        height={200}
      />
      <h2 className="text-2xl font-semibold mt-6">
        Welcome to SoapBoard
      </h2>
      <p className="text-muted-foreground text-sm mt-2">
        Create an organization to get started
      </p>
      <div className="mt-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="lg">Create organization</Button>
          </DialogTrigger>
         <DialogContent className="p-0 border-none shadow-none max-w-[480px]">
        <DialogTitle className="sr-only">Create Organization</DialogTitle>
        <CreateOrganization />
      </DialogContent>
         </Dialog>
      </div>
    </div>
  );
};