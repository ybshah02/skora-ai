import { useEffect, useRef, useState } from "react";
import arrowUp from "../images/arrow-up.svg"
import skoraIcon from "../images/skoraicon.svg"
import { EnterKeyHandler } from "./FormComponents";
import BackendService from "../services/BackendService";
import uiService from "../services/UIService";

export const AppChatWindow = () => {
  const [chatData, setChatData] = useState([]);

  useEffect(() => {
    console.log("attmpeting")
    delay(500, refreshChatData);
  }, []);

  const delay = async (ms, func) => {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    })
    func();
  };

  const refreshChatData = async () => {
    uiService.update("mainLoader", true);
    const chatData = await BackendService.fetchChatHistory();
    setChatData(chatData);
    uiService.update("mainLoader", false);
  }

  const sendMessage = async (message: string) => {
    const response = await BackendService.sendMessage(message);
    setChatData([...chatData, {role: "user", values: [message]}, {role: "assistant", values: [response.msg]}]);
    return;
  }

  return (<ChatWindow demoMode={false} chatData={chatData} refreshChatData={refreshChatData} inputHandler={sendMessage} />);
}

function ChatWindow({demoMode, chatData, refreshChatData, inputHandler}: {demoMode: boolean, chatData: any, refreshChatData: any, inputHandler: any}): JSX.Element {
  const [inputValue, setInputValue] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const chatTextBubblesRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [chatData]);

  const scrollToBottom = () => {
    if (chatTextBubblesRef.current) {
      chatTextBubblesRef.current.scrollTo({
        top: chatTextBubblesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };
  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const sendMessage = async () => {
    if (disableInput) return;
    if(inputValue.length < 1) {
      return;
    }
    console.log("BLIP BOOP")
    setDisableInput(true);
    await inputHandler(inputValue);
    setDisableInput(false);
    setInputValue("");
    delay(500);
  }

  function formatMessage(message) {
    // Replace ** with <strong> tags
    const bolded = message.replace(/\*\*(.*?)\*\*/g, '<u>$1</u>');
  
    // Split the message into paragraphs at each newline
    const paragraphs = bolded.split(/\n\n/);
  
    // Return an array of JSX elements for each paragraph
    return paragraphs.map((paragraph, index) => (
      <p style={{margin: 0}} key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
    ));
  }
  

  const democlass = demoMode ? "chat-demo-window" : "chat-window"
  return (

    <div className={democlass}>
      <div className="chat-text-bubbles" ref={chatTextBubblesRef}>
        <div className="bubble-element"><img src={skoraIcon} loading="lazy" alt="" className="chat-icon" />
          <div className="chat-text-input">Hey! I&#x27;m the sKora AI assistent. Tell me about yourself. </div>
        </div>   


        {
          (!demoMode && chatData.length > 0) ? chatData.map(msg => (
            (msg.role === "assistant") ?           
            <div className="bubble-wrapper">
            <div className="bubble-element" style={msg.values[0].length > 600 ? {maxWidth: "85%"} : {}}><img src={skoraIcon} loading="lazy" alt="" className="chat-icon" />
              <div className="chat-text-input">{formatMessage(msg.values[0])}</div>
            </div>
          </div> : 
          <div className="bubble-wrapper left">
          <div className="bubble-element left">
            <div className="chat-icon left">
              <div className="profile-icon">
                <div className="profile-icon-initial">Y</div>
              </div>
            </div>
            <div className="chat-text-input">{msg.values[0]}</div>
          </div>
        </div>
          )) :
          null
        }
        
      </div>

      <form>
      <EnterKeyHandler callback={sendMessage} className="chat-text-input-container">
        <input type="text" placeholder="Enter your message here..." className="chat-text-input-box" onChange={(e) => setInputValue(e.target.value)} value={inputValue} disabled={disableInput}/>
        <div className="up-button" onClick={() => sendMessage()} style={{cursor: disableInput ? "not-allowed" : "pointer"}}>{disableInput ? <span className="loader2"></span> : <img src={arrowUp} loading="lazy" alt="" className="image-4"/>}</div>
      </EnterKeyHandler>
      </form>
    </div>

  )
}

export default ChatWindow