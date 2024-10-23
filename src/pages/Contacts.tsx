import {
  IconType,
  SiGithub,
  SiGmail,
  SiLinkedin,
} from "@icons-pack/react-simple-icons";

function Contacts() {
  const links: { icon: IconType; href: string }[] = [
    {
      icon: SiGmail,
      href: "mailto:kimyw102699@gmail.com",
    },
    {
      icon: SiGithub,
      href: "https://github.com/Yanuk-K",
    },
    {
      icon: SiLinkedin,
      href: "https://www.linkedin.com/in/yeun-wook-kim/",
    },
  ];

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <div className="items-center">
        <div className="overflow-hidden resize-none max-w-[100%] w-[100%] h-[40vh]">
          <div
            id="embed-ded-map-canvas"
            className="h-[100%] w-[100%] max-w-[100%]"
          >
            <iframe
              className="h-[100%] w-[100%] border-none"
              src="https://www.google.com/maps/embed/v1/place?q=Osan+AB+Main+Gate,+Sinjang-ro,+Pyeongtaek-si,+Gyeonggi-do,+South+Korea&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
            ></iframe>
          </div>
        </div>
        <h3>Current Location: Pyeongtaek-si, Republic of Korea</h3>
        <div className="mr-auto mt-10 flex w-full flex-wrap items-center gap-10">
          {links.map((link, id) => {
            return (
              <a target="_blank" key={id} href={link.href}>
                <link.icon title="" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Contacts;
