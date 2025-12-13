"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                className="fixed top-4 right-4 z-30 p-2 rounded-full 
          bg-black/70 text-white dark:bg-white/80 dark:text-black 
          backdrop-blur shadow"
                suppressHydrationWarning
            >
                <Moon className="h-5 w-5" />
            </Button>
        )
    }

    const isLight = theme === "light";

    return (
        <Button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className="fixed top-4 right-4 z-30 p-2 rounded-full 
        bg-black/70 text-white dark:bg-white/80 dark:text-black 
        backdrop-blur shadow"
            suppressHydrationWarning
        >
            {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
    );
}
