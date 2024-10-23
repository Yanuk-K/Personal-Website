import { AspectRatio } from "../components/ui/aspect-ratio";

export default function Projects() {
  const PROJECTS = [
    {
      name: "project 1",
      description: "proj 1 desc",
      previewImage: "../assets/proj1.jpg",
      githubLink: "https://github.com/Yanuk-K/Personal-Website",
    },
    {
      name: "project 2",
      description: "proj 2 desc",
      previewImage: "../assets/proj2.jpg",
      githubLink: "www.github.com/proj2",
    },
    {
      name: "project 3",
      description: "proj 3 desc",
      previewImage: "../assets/proj3.jpg",
      githubLink: "www.github.com/proj3",
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
                  className="w-full rounded-base"
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

                <div className="mt-8 grid grid-cols-1 gap-5 text-base w400:text-sm">
                  <a
                    className="border-border dark:border-darkBorder text-text shadow-light dark:shadow-dark cursor-pointer rounded-base border-2 bg-main px-4 py-2 text-center uppercase transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none"
                    href={project.githubLink}
                    target="_blank"
                  >
                    Github
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
