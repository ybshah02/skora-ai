import SkoraWhite from "../images/skora-white.svg?react";
import arrowDown from "../images/arrow-down.svg"
import featureImage1 from "../images/joao-ferrao-4YzrcDNcRVg-unsplash-p-800.jpg"
import featureImage2 from "../images/sups.jpg"
import featureImage3 from "../images/logan.jpg"
import featureImage4 from "../images/crowd.jpg"
import NavigationBar from "../components/NavigationBar";
import FeatureGrid from "../components/FeatureBlock";
import ChatWindow from "../components/ChatWindow";
import InteractiveHeading from "../components/InteractiveHeading"

export function SplashScreen({heading}) {

  const scrollToContent = () => {
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const targetY = vh * 0.8;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  };

  return (
    <section className="splash">
    <div className="splash-contents">
      <div className="empty"></div>
      <InteractiveHeading heading={heading}/>
      <div className="splash-button" onClick={scrollToContent}>
        <div className="button">
          <div className="button-text">Meet Your Agent</div>
        </div><img src={arrowDown} loading="lazy" alt="" className="image-3" />
      </div>
    </div>
  </section>
  )
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


export function LandingPage() {
  return (
    <body className="body">
  <NavigationBar />
  <SplashScreen heading={<a>ACCELERATING SOCCER CAREERS.
<br /> MEET YOUR AI POWERED AGENT.
</a>} />
  <FeatureGrid blocksData= {featureBlocksData} />

  
  {/* <section className="section">
    <div className="mid-section">
      <h1 className="heading section-head">Try the skora assistant</h1>
  <ChatWindow demoMode={true} chatData={[]} inputHandler={() => {}}/>
  </div>
  </section> */}

  <section className="section">

      <div className="landing-footer">
        <div className="landing-footer-column">
          <SkoraWhite fill="white"></SkoraWhite> 
          <span>Innovation Hub, Qatar Science and Technology Park, Doha, Qatar</span>
          <span>+974 6622 9950</span>
          <span>support@skora.tech</span>
        </div>
        <div className="landing-footer-column expand"></div>
        <div className="landing-footer-column">
          <a className="link-no-style" href="https://storage.googleapis.com/skora-assets/Privacy%20Policy%20for%20sKora%20Inc.pdf" target="_blank">Privacy Policy</a>
          <a className="link-no-style" href="https://storage.googleapis.com/skora-assets/Terms%20of%20Service%20sKora.pdf" target="_blank">Terms and Conditions</a>
        </div>
      </div>
    
  </section>
  <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65b83eb61a8513f3d42c765d" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="></script>
  <script src="js/webflow.js" type="text/javascript"></script>
</body>
  );
}

export default LandingPage;