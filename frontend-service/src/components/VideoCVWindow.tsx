import { useState } from 'react';
import { Button, EnterKeyHandler, ErrorBox, InputField } from './FormComponents';
import { useNavigate } from 'react-router-dom';
import uiService from '../services/UIService';

function VideoCVWindow() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setSelectedFiles([...selectedFiles, ...e.target.files]);
  };

  const removeFile = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // not accepting submissions at the moment.
    uiService.update("callError", "We're not accepting submissions for new VideoCV applicants at the moment. Please contact 'hello@skora.tech' with any questions.")
    return;

    if (verifyFields()) {
      console.log('Form submitted:', { name, email, purpose, selectedFiles });
      // Perform submission logic here
    }
  };

  const verifyFields = () => {
    if (name.trim().length < 3) {
      uiService.update("callError", 'Name must be at least 3 characters long.');
      return false;
    }

    if (!isValidEmail(email)) {
      uiService.update("callError", 'Please enter a valid email address.');
      return false;
    }

    if (purpose.trim().length < 10) {
      uiService.update("callError", 'Purpose must be at least 10 characters long.');
      return false;
    }

    if (selectedFiles.length === 0) {
      uiService.update("callError", 'Please select at least one video file.');
      return false;
    }

    const validFileTypes = ['video/mp4', 'video/quicktime', 'video/mpeg'];
    const maxFileSize = 100 * 1024 * 1024; // 100MB

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (!validFileTypes.includes(file.type)) {
        uiService.update("callError", 'Invalid video file type. Please select MP4, MOV, or AVI files.');
        return false;
      }
      if (file.size > maxFileSize) {
        uiService.update("callError", 'Video file size exceeds the maximum limit of 100MB.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  return (
    <div className="reports-window" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <form onSubmit={handleSubmit}  style={{ width: '400px', maxWidth: '95vw' }}>
        <EnterKeyHandler className="form-section" callback={handleSubmit} >
        <InputField
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputField
          type="text"
          placeholder="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          long={true}
        />
        <div className="form-element">
          <Button text="Select Video Files" onClick={() => document.getElementById('fileInput').click()} />
          <input
            id="fileInput"
            type="file"
            accept="video/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        {selectedFiles.length > 0 && (
          <div className="file-preview">
            <h4>Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span>{file.name}</span>
                <Button text="Remove" onClick={() => removeFile(index)} />
              </div>
            ))}
          </div>
        )}
        <div className="form-element">
          <Button text="Submit & Pay" onClick={handleSubmit} />
        </div>
        </EnterKeyHandler>

      </form>
      <div className="chat-text-input" style={{ marginTop: '20px', textAlign: 'center' }}>
        * After submitting you will be taken to our payment processor. Please do not exit that page as your progress will be lost. Once you pay you will receive an email confirming your submission.
      </div>
    </div>
  );
}

export default VideoCVWindow;