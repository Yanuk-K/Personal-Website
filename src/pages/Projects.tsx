import { AspectRatio } from "../components/ui/aspect-ratio";

export default function Projects() {
  const CF_URL = "https://d3w3f1g6khau4p.cloudfront.net/proj_img/";
  const PROJECTS = [
    {
      name: "This Website",
      description:
        "Made using Vite+Typescript, designed using Neobrutalism, Material UI, Tailwind, and powered by AWS Amplify.",
      previewImage: CF_URL + "Personal_Website.png",
      githubLink: "www.github.com/proj3",
      liveLink: "https://yeunwook.kim/",
    },
    {
      name: "Grinder Calculator",
      description:
        "Grinder click caculator lets you easily convert your grinder's click sizes to other grinder's click size.",
      previewImage: CF_URL + "Grind_Calc.jpg",
      githubLink:
        "https://github.com/Yanuk-K/Personal-Website/blob/main/src/pages/GrinderCalc.tsx",
      liveLink: "/grindercalc/",
    },
    {
      name: "Lox Interpreter",
      description: "Interpreter for Lox Programming Language, written in Java",
      previewImage: CF_URL + "Lox_I_Proj.png",
      githubLink: "https://github.com/Yanuk-K/LOX_Interpreter",
      liveLink: "",
    },
  ];
  return (
    <>
      {PROJECTS.map((project, id) => {
        return (
          <div
            className="dark:bg-darkBg text-text dark:text-darkText border-b-4 border-r-4 border-b-black border-r-black bg-bg p-8 py-10 w600:px-[30px] w400:px-5"
            key={id}
          >
            <div className="mx-auto w-3/4 w800:w-full">
              <AspectRatio
                className="!-bottom-[2px] rounded-base border-2 border-black shadow-base"
                ratio={2 / 1}
              >
                <img
                  className="w-full h-full rounded-base"
                  src={`${project.previewImage}`}
                  alt={project.name}
                />
              </AspectRatio>

              <div className="mt-6">
                <h2 className="text-3xl font-bold w700:text-2xl w450:text-xl">
                  {project.name}
                </h2>

                <p className="mt-5 text-lg w450:text-base">
                  {project.description}
                </p>

                {activeLink(project)}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function activeLink(project: { liveLink: string; githubLink: string }) {
  if (project.liveLink != "" && project.githubLink != "") {
    return (
      <div className="mt-8 grid grid-cols-2 gap-5 text-base w400:text-sm">
        <a
          className="border-border dark:border-darkBorder text-text shadow-light dark:shadow-dark cursor-pointer rounded-base border-2 bg-main px-4 py-2 text-center uppercase transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
          href={project.liveLink}
          target="_blank"
        >
          Visit
        </a>
        <a
          className="border-border dark:border-darkBorder text-text shadow-light dark:shadow-dark cursor-pointer rounded-base border-2 bg-main px-4 py-2 text-center uppercase transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
          href={project.githubLink}
          target="_blank"
        >
          Github
        </a>
      </div>
    );
  } else {
    return (
      <div className="mt-8 grid grid-cols-1 gap-5 text-base w400:text-sm">
        {project.liveLink == "" ? (
          <a
            className="border-border dark:border-darkBorder text-text shadow-light dark:shadow-dark cursor-pointer rounded-base border-2 bg-main px-4 py-2 text-center uppercase transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
            href={project.githubLink}
            target="_blank"
          >
            Github
          </a>
        ) : (
          <></>
        )}
        {project.githubLink == "" ? (
          <a
            className="border-border dark:border-darkBorder text-text shadow-light dark:shadow-dark cursor-pointer rounded-base border-2 bg-main px-4 py-2 text-center uppercase transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
            href={project.liveLink}
            target="_blank"
          >
            Visit
          </a>
        ) : (
          <></>
        )}
      </div>
    );
  }
}
