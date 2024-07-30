import { useEffect, useState } from 'react';
import blurredReport from '../images/blurred-report.png';
import { Button } from './FormComponents';
import uiService from '../services/UIService';
import BackendService from '../services/BackendService';
import { useNavigate } from 'react-router-dom';
import arrowUp from "../images/arrow-up.svg"

function ReportsBlock({name, date}) {
    return (
        <div className="reports-block-single"><img src={blurredReport} loading="lazy" alt="" className="reports-block-image" />
        <div className="divider"></div>
        <div className="reports-block-text">{name.substring(0,20)}</div>
        <div className="reports-block-text-h">{date}</div>
        </div>
    )
}

function InfoWindow({messager, end}) {
    const [message, setMessg] = useState(messager);
    const [inputValue, setInputValue] = useState("");
    const [disableInput, setDisableInput] = useState(false);
    const navigate = useNavigate();

    const handleUpdateCV = async () => {
        console.log("UPDATE CV:: START");
        uiService.update("mainLoader", true); 
        setDisableInput(true);
        try {
            const result = await BackendService.updateCV(inputValue); 
            console.log(result)
            if (result.status === "success") { 
                uiService.update("mainLoader", false);
                end(result.upload_url);
                console.log("UPDATE CV:: NAVIGATE");
                // window.open(result.upload_url, "_blank");
            } else { 
                console.log("UPDATE CV:: LOOP");
                setMessg(result.msg);
                setInputValue("");
                uiService.update("mainLoader", false);
                setDisableInput(false);
            }
        } catch (error) {
            console.error("Error generating CV:", error);
        } finally {
            uiService.update("mainLoader", false); 
            setDisableInput(false);
        }
    }

    useEffect(() => {
        setMessg(messager);
    }, [messager]);

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
        }}>
        <div className="chat-demo-window" style={{
            display: "block", 
            width: "80%",
            position: "absolute",
            backgroundColor: "white",
            height: "auto",
            maxHeight: "60vh%",
            overflow: "scroll",
        }}>
            <div className="heading section-head">Needs More Information:</div>
            <div className="chat-text-bubbles" style={{width: "100%"}}>
                <div className="bubble-element" style={{maxWidth: "85%"}}><img src="https://skora-assets.s3.amazonaws.com/skoraicon.svg" loading="lazy" alt="" className="chat-icon" />
                    <div className="chat-text-input">{message}</div>
                </div>
            </div>
            

        <div className="chat-text-input-container" style={{paddingTop: "20px"}}>
          <input type="text" placeholder="Enter your message here..." className="chat-text-input-box" onChange={(e) => setInputValue(e.target.value)} value={inputValue} disabled={disableInput}/>
          <div className="up-button" onClick={handleUpdateCV} style={{cursor: disableInput ? "not-allowed" : "pointer"}}>{disableInput ? <span className="loader2"></span> : <img src={arrowUp} loading="lazy" alt="" className="image-4"/>}</div>
        </div>

        </div>
        
        </div>

    )
}

function ReportsWindow() {
    const [needsInput, setNeedsInput] = useState(false);
    const [urlList, setUrlList] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getReports();
    }
    , []);

    const handleGenerateCV = async () => {
        console.log("Generating CV:: START");
        uiService.update("mainLoader", true); 
        try {
            const result = await BackendService.generateCV(); 
            if (result.status === "success") {
                console.log("Generating CV:: URL");
                setNeedsInput(false);
                setUrlList([...urlList, {file_name: "Generated CV", url: result.url}]);
                // redirect to url
                
            } else {
                console.log("Generating CV:: POPUP");
                setMessage(result.msg);
                setNeedsInput(true);
                uiService.update("mainLoader", false);
                
            }
        } catch (error) {
            console.error("Error generating CV:", error);
            uiService.update("callError",`Error generating CV: ${error}. Please try again.`)
        } finally {
            uiService.update("mainLoader", false); 
        }
    };


    const getReports = async () => {
        uiService.update("mainLoader", true);
        try {
            const result = await BackendService.getReports();
            // Assuming result is { "documents": [] }
            if (result && Array.isArray(result.documents)) {
                setUrlList(result.documents);
            } else {
                console.error("Expected an array inside 'documents', received:", result);
                setUrlList([]); // Set to empty array if the expected structure is not met
            }
        } catch (error) {
            console.error("Error getting reports:", error);
            uiService.update("callError",`Error getting reports: ${error}`)
            setUrlList([]); // Fallback to an empty array on error
        } finally {
            uiService.update("mainLoader", false);
        }
    };
        

    const callItGood = (url) => {
        setUrlList([...urlList, {file_name: "Generated CV", url: url}]);
        setNeedsInput(false);
    }

    

    return (
        <div className="reports-window" style={{position: "relative"}}>
        {needsInput && <InfoWindow end={callItGood} messager={message}></InfoWindow>}
        <div className="reports-grow">
          <div className="reports-blocks">
            {urlList.map((url, index) => (
                <div onClick={() => {
                    console.log("URL::", url);
                    window.open(url.url, "_blank");
                }}> <ReportsBlock key={index} name={url.file_name} date=""></ReportsBlock> </div>
         ))}
          </div>
        </div>
        <div className="reports-button"><Button text="Generate CV" onClick={handleGenerateCV}></Button></div>
      </div>
    )
}

export default ReportsWindow;