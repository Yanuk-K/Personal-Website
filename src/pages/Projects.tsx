import { AspectRatio } from "../components/ui/aspect-ratio";

type Project = {
  name: string;
  description: string;
  githubLink: string;
  liveLink?: string;
};

const PROJECTS: Project[] = [
  {
    name: "This Website",
    description:
      "Made using Vite+Typescript, designed using Neobrutalism, Material UI, Tailwind, and powered by AWS Amplify.",
    githubLink: "https://github.com/Yanuk-K/Personal-Website",
    liveLink: "https://yeunwook.kim/",
  },
  {
    name: "Grinder Calculator",
    description:
      "Grinder click caculator lets you easily convert your grinder's click sizes to other grinder's click size.",
    githubLink:
      "https://github.com/Yanuk-K/Personal-Website/blob/main/src/pages/GrinderCalc.tsx",
    liveLink: "/grindercalc/",
  },
  {
    name: "Raspberry Pi Riichi Mahjong Score Calculator",
    description: "AI Riichi Mahjong score calculator using custom trained YOLO ncnn models natively running on Raspberry Pi.",
    githubLink: "https://github.com/Yanuk-K/Raspberry-Pi-YOLO-Riichi-Mahjong",

  },
  {
    name: "Lox Interpreter",
    description: "Interpreter for Lox Programming Language, written in Java",
    githubLink: "https://github.com/Yanuk-K/LOX_Interpreter",
  },
];

const linkButton =
  "rounded-base border-3 border-black bg-main px-4 py-2 font-PixelMplus text-xs font-black uppercase tracking-[0.24em] shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-1 hover:bg-accent hover:shadow-[6px_6px_0_#000] dark:border-darkBorder dark:bg-darkBg dark:hover:bg-darkAccent";

export default function Projects() {
  return (
    <div className="flex h-full flex-col bg-bg text-text dark:bg-darkBg dark:text-darkText">
      <div className="mx-auto flex w-full max-w-[660px] flex-1 flex-col gap-6 px-5 pb-8 pt-8 w800:max-w-[620px] w600:px-4 w500:max-w-[560px] w400:pb-6 w400:pt-6">
        <header className="rounded-base border-4 border-black bg-main/10 p-5 shadow-[5px_5px_0_#000] dark:border-darkBorder dark:bg-darkMain/20 dark:shadow-[5px_5px_0_#000] md:p-4">
          <p className="font-PixelMplus text-[34px] font-black uppercase tracking-[0.2em] w500:text-[28px] text-center">
            Projects
          </p>
        </header>

        <div className="flex flex-1 flex-col gap-6 pb-4">
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              className="rounded-base border-4 border-black bg-white p-5 shadow-[5px_5px_0_#000] dark:border-darkBorder dark:bg-darkMain md:p-4"
            >
              <div className="space-y-4">
                <div className="space-y-3">
                  <h2 className="font-PixelMplus text-[24px] font-black uppercase tracking-[0.18em] w500:text-[20px]">
                    {project.name}
                  </h2>
                  <p className="font-PixelMplus text-[15px] leading-relaxed tracking-[0.05em] text-[#1d1d1d] dark:text-darkText/90">
                    {project.description}
                  </p>
                  <ProjectLinks
                    liveLink={project.liveLink}
                    githubLink={project.githubLink}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

type ProjectLinksProps = Pick<Project, "liveLink" | "githubLink">;

function ProjectLinks({ liveLink, githubLink }: ProjectLinksProps) {
  const hasLive = Boolean(liveLink);
  const hasGithub = Boolean(githubLink);

  return (
    <div
      className={`grid gap-4 text-center ${hasLive && hasGithub ? "grid-cols-2 w500:grid-cols-1" : "grid-cols-1"}`}
    >
      {hasLive ? (
        <a href={liveLink} target="_blank" rel="noreferrer" className={linkButton}>
          Visit
        </a>
      ) : null}
      {hasGithub ? (
        <a
          href={githubLink}
          target="_blank"
          rel="noreferrer"
          className={linkButton}
        >
          Github
        </a>
      ) : null}
    </div>
  );
}
