import { ThemeSwitcher } from "./theme-switcher";
import clsx from "clsx";

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
      name: "CONTACTS",
    },
  ];
  const path = window.location.pathname;
  return (
    <nav className="border-b-border dark:border-b-darkBorder grid h-[50px] grid-cols-[1fr_1fr_1fr_1fr_50px] rounded-tr-base border-b-4 text-xl w600:text-lg w400:h-10 w400:text-base portrait:rounded-none">
      {menu.map((item) => (
        <a
          className={clsx(
            "flex h-full items-center justify-center uppercase",
            path === "/" + item.name.toLowerCase() + "/"
              ? "bg-black text-white"
              : "text-text"
          )}
          href={"/" + item.name.toLowerCase() + "/"}
        >
          {item.name}
        </a>
      ))}
      <ThemeSwitcher />
    </nav>
  );
}

export default Header;