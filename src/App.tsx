import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeProvider";
import { NotificationsProvider } from "./state/notifications";
import { WindowsProvider } from "./state/windows";
import { Desktop } from "./desktop/Desktop";
import { MobileHome } from "./mobile/MobileHome";
import { MobileApp } from "./mobile/MobileApp";
import { useMediaQuery } from "./lib/useMediaQuery";
import { isAppId } from "./state/fs";

function DeviceRoute({ landing = false }: { landing?: boolean }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { appId } = useParams();

  if (isMobile) {
    return (
      <WindowsProvider>
        {landing ? (
          <MobileApp appId="kate" defaultDoc="about" />
        ) : isAppId(appId) ? (
          <MobileApp appId={appId} />
        ) : (
          <MobileHome />
        )}
      </WindowsProvider>
    );
  }

  return (
    <WindowsProvider>
      <Desktop initialApp={appId} openAboutInitially={landing} />
    </WindowsProvider>
  );
}

function HomeRoute() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  return isMobile ? <MobileHome /> : <Navigate to="/" replace />;
}

const App = () => {
  return (
    <ThemeProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DeviceRoute landing />} />
            <Route path="/home" element={<HomeRoute />} />
            <Route path="/app/:appId" element={<DeviceRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationsProvider>
    </ThemeProvider>
  );
};

export default App;
