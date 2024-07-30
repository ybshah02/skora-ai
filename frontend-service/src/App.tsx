import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import LoginService from "./services/LoginService";
import { useEffect, useState } from "react";
import uiService from "./services/UIService";
import { AnimatePresence, motion } from "framer-motion";
import { AuthContextProvider } from "./contexts/AuthContext";
import InterestPage from "./pages/InterestPage";
import { ErrorBox } from "./components/FormComponents";

function App() {
  const [uiState, setUiState] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const addError = (errorMsg) => {
    const newErrorMsg = {
      id: Date.now(),
      message: errorMsg,
    };

    setErrorList((prevErrorList) => [...prevErrorList, newErrorMsg]);

    setTimeout(() => {
      removeError(newErrorMsg.id);
    }, 10000);
  };

  const removeError = (errorId) => {
    setErrorList((prevErrorList) =>
      prevErrorList.filter((error) => error.id !== errorId)
    );
  };

  useEffect(() => {
    // Register the callback
    uiService.register("mainLoader", setUiState);
    uiService.register("callError", addError);

    // Clean up by unregistering the callback
    return () => {
      uiService.unregister("mainLoader");
      uiService.unregister("callError");
    };
  }, []);

  useEffect(() => {
    console.log(errorList);
  }, [errorList]);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/signout" element={<SignOut />} />
        </Routes>
      </BrowserRouter>
      <AnimatePresence>
        {uiState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="loading-overlay"
          >
            <span className="loader"></span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        style={{
          position: "fixed",
          bottom: "15px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "auto",
          height: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          gap: "10px",
        }}
      >
        {errorList.map((error) => (
          <ErrorBox key={error.id} message={error.message} />
        ))}
      </div>
    </div>
  );
}

const SignOut = () => {
  LoginService.signOut();
  return <Navigate to="/" replace />;
};

export default App;