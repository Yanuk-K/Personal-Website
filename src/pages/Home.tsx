import { useMemo, useState } from "react";
import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import Marquee from "../components/Marquee";

type PanelKey = "now" | "stack" | "fun";

function Home() {
  const items = useMemo(
    () => [
      "Computer Science",
      "AWS",
      "Mathematics",
      "Web3.0",
      "Punk Rock",
      "Specialty Coffee",
      "Rhythm Games",
      "Riichi Mahjong",
    ],
    [],
  );

  const [activePanel, setActivePanel] = useState<PanelKey>("now");

  const panelCopy: Record<PanelKey, string[]> = {
    now: [
      "nft work certification with custom ERC1151 multisig architecture",
      "optimizing cloud infrastructure for efficient deployments",
      "dialing in light-roast pour overs for nightly build sessions",
    ],
    stack: [
      "TypeScript · React · Vite for rapid web experiences",
      "Solidity · Python · Java · C++ for cross-stack problem solving",
      "AWS (Lambda, EC2, RDS) · Docker · Kubernetes",
    ],
    fun: [
      "moshing at punk rock gigs!!!",
      "binge gaming at arcades",
      "tracking coffee recipes like patch notes",
    ],
  };

  return (
    <div className="flex h-full flex-col bg-bg text-text dark:bg-darkBg dark:text-darkText">
      <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 px-5 pb-8 pt-8 w800:max-w-[700px] w700:gap-5 w600:px-4 w500:max-w-[560px] w400:pb-6 w400:pt-6">
        <section className="rounded-base border-4 border-black bg-main/10 p-5 shadow-[5px_5px_0_#000] dark:border-darkBorder dark:bg-darkMain/20 dark:shadow-[5px_5px_0_#000] md:p-4">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)] lg:items-start lg:gap-5">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <p className="font-PixelMplus text-[38px] font-black leading-[1.05] tracking-[0.06em] lg:text-[34px] md:text-[30px] w500:text-[24px]">
                  Yeunwook Kim
                </p>
                <p className="font-PixelMplus text-[16px] leading-relaxed tracking-[0.08em] lg:text-[15px]">
                  Hi, I'm a Mathematics-Computer Science senior at UC San Diego, building web3 experiences for everyone.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                <div className="rounded-base border-4 border-black bg-white p-4 font-PixelMplus text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_#000] dark:border-darkBorder dark:bg-darkMain">
                  <p>Current Focus</p>
                  <p className="mt-2 font-PixelMplus text-[15px] normal-case tracking-[0.08em]">
                    Web3 with scalable infrastructure
                  </p>
                </div>
                <div className="rounded-base border-4 border-black bg-white p-4 font-PixelMplus text-xs font-black uppercase tracking-[0.16em] shadow-[4px_4px_0_#000] dark:border-darkBorder dark:bg-darkMain">
                  <p>Location</p>
                  <p className="mt-2 font-PixelMplus text-[15px] normal-case tracking-[0.08em]">
                    San Diego, California
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/resume"
                  className="rounded-base border-4 border-black bg-accent px-5 py-3 font-PixelMplus text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_#000] dark:border-darkBorder dark:bg-darkAccent"
                >
                  View Resume
                </a>
                <a
                  href="mailto:kimyw102699@gmail.com"
                  className="rounded-base border-4 border-black bg-white px-5 py-3 font-PixelMplus text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 hover:bg-main hover:shadow-[7px_7px_0_#000] dark:border-darkBorder dark:bg-darkMain"
                >
                  Start a Project
                </a>
              </div>
            </div>
            <div className="rounded-base border-4 border-black bg-white/90 p-4 font-PixelMplus text-[11px] font-black uppercase tracking-[0.14em] shadow-[4px_4px_0_#000] dark:border-darkBorder dark:bg-darkMain/70">
              <p className="text-center text-[14px] tracking-[0.18em]">Vitals</p>
              <ul className="mt-3 space-y-2 font-PixelMplus text-[14px] normal-case tracking-[0.05em]">
                <li>
                  Discipline: Math-CS · UC San Diego (’26)
                </li>
                <li>Focus Areas: Web3 · Cloud Computing · AI</li>
                <li>Community: Blockchain at San Diego</li>
                <li>
                  Coffee Script: Light roast · 30g · 16.6:1 · 93°C · Origami + V60 filters
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-base border-4 border-black bg-white p-5 shadow-[5px_5px_0_#000] dark:border-darkBorder dark:bg-darkMain md:p-4">
          <div className="flex flex-wrap gap-3 font-PixelMplus text-xs font-black uppercase tracking-[0.18em]">
            <button
              type="button"
              onClick={() => setActivePanel("now")}
              className={`rounded-base border-3 border-black px-4 py-2 shadow-[4px_4px_0_#000] transition-colors ${activePanel === "now" ? "bg-accent" : "bg-bg hover:bg-main"} dark:border-darkBorder dark:bg-darkBg dark:hover:bg-darkMain`}
            >
              Now Playing
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("stack")}
              className={`rounded-base border-3 border-black px-4 py-2 shadow-[4px_4px_0_#000] transition-colors ${activePanel === "stack" ? "bg-accent" : "bg-bg hover:bg-main"} dark:border-darkBorder dark:bg-darkBg dark:hover:bg-darkMain`}
            >
              Toolkit
            </button>
            <button
              type="button"
              onClick={() => setActivePanel("fun")}
              className={`rounded-base border-3 border-black px-4 py-2 shadow-[4px_4px_0_#000] transition-colors ${activePanel === "fun" ? "bg-accent" : "bg-bg hover:bg-main"} dark:border-darkBorder dark:bg-darkBg dark:hover:bg-darkMain`}
            >
              Side Quests
            </button>
          </div>
          <div className="mt-5 grid gap-4 font-PixelMplus text-[15px] leading-relaxed tracking-[0.05em]">
            {panelCopy[activePanel].map((line) => (
              <div
                key={line}
                className="rounded-base border-3 border-black bg-main/10 px-4 py-3 shadow-[4px_4px_0_#000] dark:border-darkBorder dark:bg-darkMain/40"
              >
                {line}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-base border-4 border-black bg-[#fef4d2] p-4 shadow-[4px_4px_0_#000] dark:border-darkBorder dark:bg-darkBg/60">
            <p className="font-PixelMplus text-xs font-black uppercase tracking-[0.22em]">
              Built With
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-5 w500:gap-3">
              <a
                className="inline-flex items-center gap-2 rounded-base border-2 border-black bg-white px-3 py-2 font-PixelMplus text-xs uppercase tracking-[0.3em] shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 dark:border-darkBorder dark:bg-darkMain"
                href="https://vitejs.dev"
                target="_blank"
                rel="noreferrer"
              >
                <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
                Vite
              </a>
              <a
                className="inline-flex items-center gap-2 rounded-base border-2 border-black bg-white px-3 py-2 font-PixelMplus text-xs uppercase tracking-[0.3em] shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 dark:border-darkBorder dark:bg-darkMain"
                href="https://react.dev"
                target="_blank"
                rel="noreferrer"
              >
                <img src={reactLogo} className="h-8 w-8" alt="React logo" />
                React
              </a>
            </div>
          </div>
        </section>
      </div>
      <div className="mx-auto w-full max-w-[880px]">
        <Marquee items={items} />
      </div>
    </div>
  );
}

export default Home;
