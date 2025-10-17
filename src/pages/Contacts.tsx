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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.6426728160895!2d-117.23693542334811!3d32.88117247865416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dc06c4414caf4f%3A0xefb6aafc89913ea7!2sUniversity%20of%20California%20San%20Diego!5e0!3m2!1sen!2sus!4v1760687981973!5m2!1sen!2sus"
            ></iframe>
          </div>
        </div>
        <h3>Current Location: San Diego, CA</h3>
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
