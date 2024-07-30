import { useState } from 'react';
import SkoraWhite from "../images/skora-white.svg?react";
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom';
import MenuIcon from "../images/menu-icon.svg?react";


function SideNavigation({ activeText, navigationData, updateOnClick }) {

  const [dropdownToggled, setDropdownToggled] = useState(false);
  const [navDropToggled, setNavDropToggled] = useState(false);

  const navigate = useNavigate();

  const navClick = (text) => {
    setNavDropToggled(false);
    setDropdownToggled(false);
    updateOnClick(text);
  }

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      display: "none",
      transition: {
        when: "afterChildren"
      }
    },
    visible: {
      opacity: 1,
      height: "auto",
      display: "flex",
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const toggleNavDrop = () => {
    setNavDropToggled(!navDropToggled)
  }

  const toggleDropdown = () => {
    setDropdownToggled(!dropdownToggled)
  }

  return (
    <div className="side-navbar">
      <div className="center-child">
        <SkoraWhite className="nav-logo" fill="#444444" />
        <div className="flex-spacer mobile-only" ></div>
        <div className="nav-item-wrapper mobile-only" onClick={toggleNavDrop}>
        <div className="nav-text mobile-only" style={{ color: "#444444" }}>
            {activeText}
          </div>
          <MenuIcon stroke="#444444" />
        </div>
      </div>
      <div className="side-nav-options">
        <div className="divider"></div>

        {navigationData.main.map((item) => (
          <div className="side-nav-item" onClick={() => { navClick(item.text) }}>
            {item.icon}
            <div className={`nav-text ${activeText === item.text ? 'active' : ''}`}>{item.text}</div>
          </div>
        ))}



        <div className="flex-spacer"></div>
        <div className="divider"></div>
        <div className="side-nav-profile-wrapper" onClick={toggleDropdown}>
          <div className="side-nav-item">
            <div className="profile-icon">
              <div className="profile-icon-initial">Y</div>
            </div>
            <div className="nav-text active">Logged In: User</div>
          </div>
          <motion.div
            className="side-nav-profile-popup"
            initial="hidden"
            animate={dropdownToggled ? "visible" : "hidden"}
            exit="hidden"
            variants={dropdownVariants}>
              {navigationData.dropDown.map((item) => (
              <label onClick={() => {navClick(item.text)}} >
              <div className="side-nav-item">{item.icon}
              <div className={`nav-text ${activeText === item.text ? 'active' : ''}`}>{item.text}</div>
            </div>
            </label >
            ))}
          </motion.div>
          {/* <div className="side-nav-profile-popup">

          </div> */}
        </div>
      </div>
      <motion.div
        className='side-nav-dropdown'
        initial="hidden"
        animate={navDropToggled ? "visible" : "hidden"}
        variants={dropdownVariants}
        style={{ overflow: 'hidden' }}
      >
        {navigationData.main.map((item) => (
          <div className="side-nav-item" onClick={() => { navClick(item.text) }}>
            {item.icon}
            <div className={`nav-text ${activeText === item.text ? 'active' : ''}`}>{item.text}</div>
          </div>
        ))}
        <div className="divider"></div>
        <div className="side-nav-profile-wrapper" onClick={toggleDropdown}>
          <div className="side-nav-item">
            <div className="profile-icon">
              <div className="profile-icon-initial">Y</div>
            </div>
            <div className="nav-text active">Logged In: User</div>
          </div>
          <motion.div
            className="side-nav-profile-popup"
            initial="hidden"
            animate={dropdownToggled ? "visible" : "hidden"}
            exit="hidden"
            variants={dropdownVariants}>
            {navigationData.dropDown.map((item) => (
              <label onClick={() => {navClick(item.text)}} >
              <div className="side-nav-item">{item.icon}
              <div className={`nav-text ${activeText === item.text ? 'active' : ''}`}>{item.text}</div>
            </div>
            </label >
            ))}
            
            {/* <div className="side-nav-item">{navigationData.main[0].icon}
              <div className="nav-text" onClick={() => { navClick("Settings") }}>Account Settings</div>
            </div>
            <div className="side-nav-item">{navigationData.main[0].icon}
              <div className="nav-text" onClick={() => { navigate("/signout") }}>Log OUt</div>
            </div> */}
          </motion.div>
          {/* <div className="side-nav-profile-popup">

          </div> */}
        </div>

      </motion.div>
    </div>
  )
}


export default SideNavigation