import { useState, useEffect } from 'react';
import MenuIcon from "../images/menu-icon.svg?react";
import SkoraWhite from "../images/skora-white.svg?react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function NavigationDropDown({ foreground, background }): JSX.Element {
  return (
    <div className='nav-dropdown' style={{ color: foreground, backgroundColor: background }}>
      <div className='nav-text'></div>
    </div>
  );
}

function NavigationIconTextItem() {
  return <div />;
}

function NavigationBar(): JSX.Element {
  const [isPast100vh, setIsPast100vh] = useState(false);
  const [dropdownToggled, setDropdownToggled] = useState(false);
  const navigate = useNavigate();

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: { when: "afterChildren" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { when: "beforeChildren", staggerChildren: 0.1 },
    },
  };

  const checkScrollPosition = () => {
    if (window.scrollY > window.innerHeight) {
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
    <div className="nav-wrapper">
      <div className="navbar" style={{ backgroundColor: background }}>
        <div className="nav-item-wrapper" onClick={toggleDropdown}>
          <MenuIcon fill={foreground} stroke={foreground} />
          <div className="nav-text" style={{ color: foreground }}>
            Home
          </div>
        </div>
        <div className="nav-item-wrapper">
          <SkoraWhite className="nav-logo" fill={foreground} />
        </div>
        <div
          className="nav-text"
          style={{ color: foreground, cursor: "pointer" }}
          onClick={() => navigate('/login')}
        >
          Login / Signup
        </div>
      </div>
      <motion.div
        className='nav-dropdown-wrapper'
        initial="hidden"
        animate={dropdownToggled ? "visible" : "hidden"}
        variants={dropdownVariants}
        style={{ overflow: 'hidden' }}
      >
        <NavigationDropDown foreground={foreground} background={background} />
      </motion.div>
    </div>
  );
}

export default NavigationBar;