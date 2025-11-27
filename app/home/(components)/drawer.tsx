"use client";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface DrawerProps {
  open: boolean;
  setOpen: (status: boolean) => void;
}

export default function ComingSoonDrawer({ open, setOpen }: DrawerProps) {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="dark:bg-[#0B0A1B] bg-white border-none">
        <DrawerHeader>
          <DrawerTitle className="text-center text-lg font-semibold dark:text-white">
            Coming Soon
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-6 pb-10 flex flex-col items-center justify-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            This feature is under development.
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
