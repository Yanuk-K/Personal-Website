import {
  createBrowserRouter,
  RouterProvider,
  LoaderFunction,
  ActionFunction,
} from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import Header from "./components/Header";

interface RouteCommon {
  loader?: LoaderFunction;
  action?: ActionFunction;
  ErrorBoundary?: React.ComponentType<any>;
}

interface IRoute extends RouteCommon {
  path: string;
  Element: React.ComponentType<any>;
}

interface Pages {
  [key: string]: {
    default: React.ComponentType<any>;
  } & RouteCommon;
}

const pages: Pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
const routes: IRoute[] = [];
for (const path of Object.keys(pages)) {
  const fileName = path.match(/\.\/pages\/(.*)\.tsx$/)?.[1];
  if (!fileName) {
    continue;
  }

  const normalizedPathName = fileName.includes("$")
    ? fileName.replace("$", ":")
    : fileName.replace(/\/index/, "");

  routes.push({
    path: fileName === "index" ? "/" : `/${normalizedPathName.toLowerCase()}`,
    Element: pages[path].default,
    loader: pages[path]?.loader as LoaderFunction | undefined,
    action: pages[path]?.action as ActionFunction | undefined,
    ErrorBoundary: pages[path]?.ErrorBoundary,
  });
}

const router = createBrowserRouter(
  routes.map(({ Element, ErrorBoundary, ...rest }) => ({
    ...rest,
    element: <Element />,
    ...(ErrorBoundary && { errorElement: <ErrorBoundary /> }),
  }))
);

const App = () => {
  return (
    <>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        <div className="outline-border dark:outline-darkBorder grid h-[800px] max-h-[100dvh] w-[1000px] max-w-[100dvw] grid-cols-[100px_auto] rounded-base shadow-[10px_10px_0_0_#000] outline outline-4 w600:grid-cols-[70px_auto] w500:grid-cols-1 portrait:h-[100dvh] portrait:w-[100dvw]">
          <header className="border-r-border dark:border-r-darkBorder relative flex items-center justify-center rounded-l-base border-r-4 bg-main dark:bg-darkMain portrait:hidden portrait:rounded-none">
            <h1 className="-rotate-90 whitespace-nowrap text-[40px] font-bold tracking-[4px] smallHeight:text-[30px] smallHeight:tracking-[2px]">
              <span className="text-text dark:text-darkText inline-block">
                Yeunwook Kim
              </span>
            </h1>
          </header>
          <main className="dark:bg-darkBg relative flex h-[800px] max-h-[100dvh] flex-col rounded-br-base rounded-tr-base bg-bg portrait:h-[100dvh] portrait:max-h-[100dvh] portrait:w-[100dvw] portrait:max-w-[100dvw] portrait:rounded-none">
            <div className="font-semibold">
              <Header></Header>
            </div>
            <div className="main h-full max-h-[750px] overflow-y-auto portrait:max-h-[calc(100dvh-50px)]">
              <RouterProvider router={router} />
            </div>
          </main>
        </div>
      </ThemeProvider>
    </>
  );
};

export default App;
