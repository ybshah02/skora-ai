import { useEffect, useState } from "react";
import { Button } from "./FormComponents";
import BackendService from "../services/BackendService";
import uiService from "../services/UIService";

function SettingsWindow() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [picture_url, setPictureUrl] = useState(null);

    useEffect(() => {
        fetchProfilePhoto();
    }, [BackendService])

    const fetchProfilePhoto = async () => {
        try {
          const photo_obj = await BackendService.getProfilePhoto();
          console.log("Photo fetched successfully");
          setPictureUrl(photo_obj.upload_url);
        } catch (error) {
          console.error("Error fetching photo:", error);
        }
      };
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        setSelectedFile(file);
        setFileName(file.name);
      } else {
        setSelectedFile(null);
        setFileName('');
      }
    };

    const handlePhotoUpload = async () => {
      if (!selectedFile) {
        console.log("No file selected.");
        return;
      }
    
      try {
        uiService.update("mainLoader", true);
    
        // Generate upload URL
        const { upload_url } = await BackendService.setProfilePhoto(selectedFile);
    
        // Upload the photo using the generated URL
        // await BackendService.uploadProfilePhoto(upload_url, selectedFile);
    
        setPictureUrl(upload_url);
      } catch (error) {
        console.error("Error uploading photo:", error);
      } finally {
        uiService.update("mainLoader", false);
        fetchProfilePhoto();
        setSelectedFile(null);
        setFileName('');
      }
    };


    

    return (
        <div style={{ display: "block" }}>
        <div className="heading section-head">Set Profile Picture</div>
        {picture_url && <img style= {{maxHeight: "30vh", padding: "10px"}}src={picture_url}/>}
        <div>
          <input 
            type="file" 
            id="file" 
            name="file" 
            style={{ display: 'none' }} 
            accept=".jpg, .jpeg, .png"
            onChange={handleFileChange} 
          />
          <label htmlFor="file">
            <Button hollow={true} text="Upload Profile Picture" onClick={() => {}} />
          </label>
        </div>
        <div className="chat-text-input">Selected File: {fileName}</div>
        <Button text="Save" onClick={() => {handlePhotoUpload()}} />
      </div>
    );
}

export default SettingsWindow;