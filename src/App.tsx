import { AGENTS, ClippyProvider } from "@react95/clippy";
import Login from "./components/Login";
import WindowBar from "./components/WindowBar";
import { useAuth } from "./store/auth";
import DesktopIcon from "./components/DesktopIcon";
import Contact from "./components/Contact";
import { Amovie2, Inetcpl1313, Joy102, Wordpad, Mail } from "@react95/icons";
import { Video } from "@react95/core";
import Resume from "./components/Resume";
import Game from "./components/Game";

function App() {
  const authinicated = useAuth((state) => state.authinicated);
  return (
    <div style={{ width: "100%", background: "#098684", minHeight: "100vh",position:"relative" }}>
      <img src="/logo.png" width={400} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-70%)"}}/>
      {!authinicated && <Login />}

      {authinicated && (
        <ClippyProvider agentName={AGENTS.MERLIN}>
          <div className="fixed">
            <DesktopIcon icon={<Amovie2 variant="32x32_4"/>} name="Video">
              <Video
                w="420px"
                src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
                
              />
            </DesktopIcon>
            <DesktopIcon icon={<Inetcpl1313 variant="32x32_4"/>} name="Browser">
             <iframe width={800} height={500} src="https://swisscows.com"/>
            </DesktopIcon>
            <DesktopIcon width={650} icon={<Wordpad variant="32x32_4"/>} name="Resume">
             <Resume/>
            </DesktopIcon>
            <DesktopIcon width={400} height={400} icon={<Joy102 variant="32x32_4"/>} name="Game">
             <Game/>
            </DesktopIcon>
            <DesktopIcon width={400} icon={<Mail variant="32x32_4"/>} name="Contact">
             <Contact/>
            </DesktopIcon>
          </div>
          <WindowBar />
        </ClippyProvider>
      )}
    </div>
  );
}

export default App;
