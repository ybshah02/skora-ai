import SkoraWhite from "../images/skora-white.svg?react";
import { InputField, Button, ErrorBox, EnterKeyHandler } from "../components/FormComponents";
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import LoginService from "../services/LoginService";
import uiService from "../services/UIService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const LoginForm = ({ onLogin, onSwitchToSignup, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <EnterKeyHandler className="form-section" callback={handleSubmit}>
      <InputField
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <InputField
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="form-element">
        <Button text="Login" onClick={handleSubmit} />
        <Button text="Signup" hollow={true} onClick={onSwitchToSignup} />
      </div>
      <div className="form-element" onClick={onGoBack}>
        <div className="nav-text orange">&lt;- back to home</div>
      </div>
      </EnterKeyHandler>
    </form>
  );
};

const SignupForm = ({ onSignup, onSwitchToLogin, onGoBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (event) => {
    console.log("getting here")
    event.preventDefault();
    if (verifyFields()) {
      onSignup(name, email, password);
    }
  };

  const verifyFields = () => {
    if (password !== confirm) {
      uiService.update("callError", "Passwords do not match");
      return false;
    }
    if (email.length === 0 || password.length === 0 || name.length === 0) {
      uiService.update("callError", "Please fill in all fields");
      return false;
    }
    if (password.length < 8) {
      uiService.update("callError", "Password must be at least 8 characters");
      return false;
    }
    if (name.length < 3) {
      uiService.update("callError", "Name must be at least 3 characters");
      return false;
    }
    if (!email.includes("@")) {
      uiService.update("callError", "Please enter a valid email address");
      return false;
    }
    if (!email.includes(".")) {
      uiService.update("callError", "Please enter a valid email address");
      return false;
    }
    if (email.includes(" ")) {
      uiService.update("callError", "Please enter a valid email address");
      return false;
    }
    if (password.includes(" ")) {
      uiService.update("callError", "Password cannot contain spaces");
      return false;
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit}>
      <EnterKeyHandler className="form-section" callback={handleSubmit}>
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
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <InputField
        type="password"
        placeholder="Confirm Password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <div className="form-element">
        <Button text="Signup" onClick={handleSubmit}/>
        <Button text="Login" hollow={true} onClick={onSwitchToLogin} />
      </div>
      <div className="form-element" onClick={onGoBack}>
        <div className="nav-text orange">&lt;- back to home</div>
      </div>
      </EnterKeyHandler>
    </form>
  );
};

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    uiService.update("mainLoader", false);
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/chat");
      }
    });
  }, [navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      uiService.update("mainLoader", true);
      await LoginService.signInWithEmailPassword(email, password);
      console.log("Logged in successfully");
      navigate('/chat');
      uiService.update("mainLoader", false);
    } catch (error) {
      console.error("Authentication failed:", error);
      uiService.update("callError", "Failed to login. Incorrect email or password.");
      uiService.update("mainLoader", false);
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      uiService.update("mainLoader", true);
      await LoginService.signUpWithEmailPassword(name, email, password);
      console.log("Logged in successfully");
      uiService.update("mainLoader", false);
      navigate('/chat');
    } catch (error) {
      console.error("Sign Up failed:", error);
      uiService.update("callError", "Failed to signup. Please contact support.");
      uiService.update("mainLoader", false);
    }
  };

  const switchForm = () => {
    setIsLogin(!isLogin);
  };

  const onGoBack = () => {
    navigate('/');
    console.log("Go back to the home page");
  };

  return (
    <div className="center-vertical">
      <div className="form-section">
        <div className="center-child">
          <SkoraWhite className="nav-logo" fill="#444444" />
        </div>
        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToSignup={switchForm}
            onGoBack={onGoBack}
          />
        ) : (
          <SignupForm
            onSignup={handleSignup}
            onSwitchToLogin={switchForm}
            onGoBack={onGoBack}
          />
        )}
      </div>
    </div>
  );
}

export default LoginPage;