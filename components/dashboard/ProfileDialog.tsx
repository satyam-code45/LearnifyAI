import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
  } from "@/components/ui/dialog";
import Credits from "./Credits";
  
  function ProfileDialog({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg rounded-lg">
            <DialogHeader>
              <DialogDescription asChild>
                <Credits />
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  export default ProfileDialog;
  