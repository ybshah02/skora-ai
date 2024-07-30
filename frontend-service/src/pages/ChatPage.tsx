import ChatWindow, { AppChatWindow } from "../components/ChatWindow";
import SideNavigation from "../components/SideNavigation";
import { useNavigate } from "react-router-dom";
import LoginService from "../services/LoginService";
import { useEffect, useState } from "react";
import BackendService from "../services/BackendService";
import uiService from "../services/UIService";
import PaperClipIcon from "../images/icons/paper-clip.svg?react";
import ChatIcon from "../images/icons/chat.svg?react";
import SettingsIcon from "../images/icons/settings-icon.svg?react";
import LogoutIcon from "../images/icons/logout-icon.svg?react";
import MyPlanIcon from "../images/icons/my-plan-icon.svg?react";
import ReportsWindow from "../components/ReportsWindow";
import SettingsWindow from "../components/SettingsWindow";
import VideoIcon from "../images/icons/video-icon.svg?react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import VideoCVWindow from "../components/VideoCVWindow";
import LogoutWindow from "../components/LogoutWindow";

function ChatPage() {
    const navigate = useNavigate();
    const [activeText, setActiveText] = useState("Chat");



    const navigationData = { main: [
      {
        icon: <ChatIcon stroke={activeText === "Chat" ? "#444444" : "#8F8F8F"} className="side-nav-icon"/>,
        text: "Chat"
      },
      {
        icon: <PaperClipIcon stroke={activeText === "Reports" ? "#444444" : "#8F8F8F"} className="side-nav-icon"/>,
        text: "Reports"
      },
      {
        icon: <VideoIcon stroke={activeText === "Video CV Request" ? "#444444" : "#8F8F8F"} className="side-nav-icon"/>,
        text: "Video CV Request"
      }
  ],
      dropDown: [
        {
          icon: <SettingsIcon stroke={activeText === "Settings" ? "#444444" : "#8F8F8F"} className="side-nav-icon"/>,
          text: "Settings"
        },
        {
          icon: <LogoutIcon stroke={"#8F8F8F"} className="side-nav-icon"/>,
          text: "Logout"
        }
        

      ]}



    const updateOnClick = (text) => {
      console.log("updateOnClick:::", text);
      setActiveText(text);
    }

    useEffect(() => {

      const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("is signed in");
               
            const uid = user.uid;
          } else {
            navigate("/login");
          }
        });

    }, [navigate]);

    


    return (
      <div className="section">
      <div className="chat-layout">

        <SideNavigation activeText={activeText} navigationData = {navigationData} updateOnClick={updateOnClick}/>
        <div className="app-window">
        {activeText === "Chat" && <AppChatWindow />}
        {activeText === "Reports" && <ReportsWindow/>}
        {activeText === "Video CV Request" && <VideoCVWindow />}
        {activeText === "Settings" && <SettingsWindow/>}
        {activeText === "Logout" && <LogoutWindow/>}
        </div>
      </div>
    </div>
    );
  }
  
  export default ChatPage;