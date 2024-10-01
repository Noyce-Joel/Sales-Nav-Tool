"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <label
      className="relative border dark:border-black border-white rounded-full flex w-10 h-6 p-1"
     
    >
      <input id="mode-toggle" type="checkbox" className="opacity-0 w-0 h-0" />
      <div
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={` cursor-pointer border-1 dark:border-white border-black inset-0 rounded-full transition-all duration-300 ease-in-out flex gap-1 items-center `}
      >
        <MoonIcon className="w-4 h-3 absolute left-1 text-white dark:text-black " />
        <div
          className={` absolute flex items-center w-4 h-4 dark:bg-[#1E1E1E] bg-white rounded-full transition-transform duration-300 ease-in-out ${
            theme === "dark" ? "translate-x-[100%]" : "translate-x-[0%]"
          }`}
        ></div>
        <SunIcon className="w-4 h-3 absolute right-1 text-white dark:text-black " />
      </div>
    </label>
  );
}
