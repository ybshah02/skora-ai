import { useEffect, useState } from "react";
import arrowDown from "../images/arrow-down.svg"
import SkoraWhite from "../images/skora-white.svg?react";
import { useNavigate } from "react-router-dom";
import { SplashScreen } from "./LandingPage";
import { ErrorBox, InputField } from "../components/FormComponents";
import FeatureGrid from "../components/FeatureBlock";
import featureImage1 from "../images/joao-ferrao-4YzrcDNcRVg-unsplash-p-800.jpg"
import featureImage2 from "../images/sups.jpg"
import featureImage3 from "../images/logan.jpg"
import featureImage4 from "../images/crowd.jpg"

function NavigationBar(): JSX.Element {
    const [isPast100vh, setIsPast100vh] = useState(false);
    const [dropdownToggled, setDropdownToggled] = useState(false);

    const navigate = useNavigate();

    const dropdownVariants = {
        hidden: { 
            opacity: 0,
            height: 0,
            transition: {
                when: "afterChildren"
            }
        },
        visible: { 
            opacity: 1,
            height: "auto", 
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };


    const checkScrollPosition = () => {
        if (window.scrollY > window.innerHeight) { // 100vh
            setIsPast100vh(true);
        } else {
            setIsPast100vh(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', checkScrollPosition);

        return () => {
            window.removeEventListener('scroll', checkScrollPosition);
        };
    }, []);

    const foreground = isPast100vh ? "#444444" : "white";
    const background = isPast100vh ? "rgba(241, 241, 241, 1" : "rgba(217, 217, 217, .2)";

    const toggleDropdown = () => {
        setDropdownToggled(!dropdownToggled);
    };

    return (
        
        <div className="nav-wrapper-copy">
            <div className="navbar-copy" style={{ backgroundColor: background }}>

                <div className="nav-item-wrapper">
                    <SkoraWhite className="nav-logo-copy" fill={foreground} />
                </div>
            </div>
            
        </div>
        
    );
};

function InterestPage() {
  const [email, setEmail] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState("");

  const verifyFields = () => {
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!email.includes(".")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (email.includes(" ")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  }

  const handleSubmit = async () => {
    console.log("Submitting email:", email);
    if (!verifyFields()) {
      return;
    }
    const response = await fetch("https://skora.ai/api/interest/add", {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({email: email})
  }).then((res) => {
    console.log("Email submitted successfully");
    setHasSubmitted(true);
  }).catch((error) => {
    console.error("Error submitting email:", error);
    setError("Error submitting email. Please try again later.");
  });
  
  }

  
  const featureBlocksData = [
    {
      big: true,
      imageUrl: featureImage1,
      title: 'Showcase your talent',
      description: 'Professional Soccer CV',
    },
    {
      big: false,
      imageUrl: featureImage2,
      title: 'Tailored just for you',
      description: 'Customized Recommendation Report',
    },
    {
      big: false,
      imageUrl: featureImage3,
      title: 'At Your Fingertips',
      description: 'Game-Changing Insights',
    },
    {
      big: true,
      imageUrl: featureImage4,
      title: 'Unlock Your Potential',
      description: 'Recruitment Opportunities',
    },
  ];

  return (
    <div>
  <NavigationBar />
  <SplashScreen heading={<a>Accelerating soccer careers.<br /> Meet your ai powered agent.</a>} />
  <section className="section">
    <div className="mid-section">
      <h1 className="heading section-head centered">Sign up for early access </h1>
      {!hasSubmitted &&<div className="early-access-block-text">Revolutionize your soccer career with our AI-powered agent, designed to replace traditional agents by offering personalized training, CV enhancement, and nutrition plans directly to you. No intermediaries, just focused support to elevate your game. Sign up for early access to explore how we&#x27;re changing the game! </div>}
      {hasSubmitted && <div className="early-access-block-text">Thank you for signing up! We will be in touch soon.</div>}
      {error != '' && <div className="early-access-block-text" style={{color: "red"}}>{error}</div>}

        <div className="temp-center" style={hasSubmitted ? {display: "none"}: {}}>
        <InputField type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="temp-center" style={hasSubmitted ? {display: "none"}: {}}>
        <div className="button">
          <div className="button-text" onClick={handleSubmit}>Sign up</div>
        </div>
      </div>
    </div>
  </section>
  <div className="spacer15vh"></div>
  <FeatureGrid blocksData={featureBlocksData}/>

  <section className="section">
    <div className="mid-section">
      <div className="spacer15vh"></div>
    </div>
  </section>

  </div>
  
  );
}

export default InterestPage;