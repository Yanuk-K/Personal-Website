import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import Marquee from "../components/Marquee";

function Home() {
  const items = [
    "Computer Science",
    "AWS",
    "Mathematics",
    "Web3.0",
    "Punk Rock",
    "Specialty Coffee",
  ];
  return (
    <div className="min-h-[87dvh] flex flex-col justify-between">
      <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
        <p>
          Hi👋 I’m Yeunwook Kim, a senior at UCSD majoring in
          Mathematics-Computer Science based in San Diego, CA.
        </p>

        <div>
          Frameworks used to make this website:
          <div className="flex-row flex">
            <a className="" href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a className="" href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
        </div>
      </div>
      <div className="">
        <Marquee items={items} />
      </div>
    </div>
  );
}

export default Home;
