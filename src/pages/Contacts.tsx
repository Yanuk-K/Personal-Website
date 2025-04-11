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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d203317.18639187005!2d127.22209655!3d37.22798575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357b523d6ace33f5%3A0x9d3235701951b5fb!2sYongin-si%2C%20Gyeonggi-do!5e0!3m2!1sen!2skr!4v1744382965116!5m2!1sen!2skr"
            ></iframe>
          </div>
        </div>
        <h3>Current Location: Yongin-si, Republic of Korea</h3>
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
