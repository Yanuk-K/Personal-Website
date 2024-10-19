import reactLogo from "../assets/react.svg";
import viteLogo from "../assets/vite.svg";
import Marquee from "../components/Marquee";

function Main() {
  const items = [
    "Computer Science",
    "Mathematics",
    "Web3.0",
    "Cryptocurrency",
    "Punk Rock",
  ];
  return (
    <div className="min-h-[87dvh] flex flex-col justify-between">
      <div className="flex-grow">
        <div>
          <h3>
            Hi👋 I’m Yeunwook Kim, a senior at UCSD majoring in
            Mathematics-Computer Science based in Seoul, South Korea.
          </h3>
        </div>
        <p>
          Frameworks used to make this website:
          <div>
            <a href="https://vitejs.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
        </p>
      </div>
      <div className="">
        <Marquee items={items} />
      </div>
    </div>
  );
}

export default Main;
