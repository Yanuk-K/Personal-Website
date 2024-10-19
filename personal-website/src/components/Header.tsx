import React from "react";
import { ThemeSwitcher } from "./theme-switcher";

function Header() {
  const menu = [
    {
      id: 1,
      name: "HOME",
    },
    {
      id: 2,
      name: "PROJECTS",
    },
    {
      id: 3,
      name: "RESUME",
    },
    {
      id: 4,
      name: "INTERESTS",
    },
    {
      id: 5,
      name: "CONTACTS",
    },
  ];
  return (
    <div className="border-b-border dark:border-b-darkBorder rounded-tr-base border-b-4 text-xl w600:text-lg w400:h-10 w400:text-base portrait:rounded-none">
      <div className="flex items-center border-b-[1px] justify-evenly">
        {menu.map((item) => (
          <div
            className="cursor-pointer
                hover:underline font-medium"
          >
            <a href={"/" + item.name.toLowerCase() + "/"}>
              <h2>{item.name}</h2>
            </a>
          </div>
        ))}
        <ThemeSwitcher />
      </div>
    </div>
  );
}

export default Header;
