import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const InteractiveHeading = ({heading}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const stringHeading = String("skora.ai skora.ai skora. ai");
  const letters = stringHeading.split('');

  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculateRotation = (offset = 0) => {
    const centerX = windowSize.width / 2;
    const centerY = windowSize.height / 2;
    const distanceX = (mousePosition.x - centerX) / centerX * 0.2;
    const distanceY = (mousePosition.y - centerY) / centerY * 0.2;

    const rotateY = distanceX * (20 + offset); // Increase for shadow layer
    const rotateX = -distanceY * (20 + offset); // Increase for shadow layer

    return { rotateX, rotateY };
  };

  const rotation = calculateRotation();
  const shadowRotation = calculateRotation(5); // Slightly more rotation for the shadow for depth

  const letterWaveAnimation = {
    initial: { y: 0 },
    animate: i => ({
      y: [0, -10, 0],
      transition: {
        delay: i * 0.05, // Adjust delay between each letter for wave effect
        repeat: Infinity,
        repeatType: "loop",
        duration: 0.6,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div style={{ position: 'relative', perspective: '1000px' }}>
            <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          color: 'rgba(0,0,0,0.5)', // Shadow color, adjust as needed
        }}
        animate={{
          rotateX: shadowRotation.rotateX,
          rotateY: shadowRotation.rotateY,
          rotateZ: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 12,
        }}
      >
        <h1 className="heading" style={{color: 'rgba(0,0,0,1)'}}>{heading}</h1>
      </motion.div>
      <motion.div
        style={{
          color: '#FFF', // Adjust main text color as needed
        }}
        animate={{
          rotateX: rotation.rotateX,
          rotateY: rotation.rotateY,
          rotateZ: 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 12,
        }}
      >
        <h1 className="heading">{heading}</h1>
      </motion.div>
      {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterWaveAnimation}
          initial="initial"
          animate={() => letterWaveAnimation.animate(index)}
          style={{ display: 'inline-flex', margin: '0 0px' }} // Adjust spacing between letters if needed
        >
          <h1 className='heading' >{letter} </h1>
        </motion.span>
      ))}
    </div> */}
    </div>

  );
};

export default InteractiveHeading;
