import React, { useEffect, useState } from 'react';

export const EnterKeyHandler = ({callback, children, className }) => {

  const handleEnter = (e) => {

    if (e.target.tagName === 'TEXTAREA') {
      return;
    }

    const form = e.target.closest('form');
    const inputs = form.getElementsByClassName('chat-text-input-box');
    const index = Array.prototype.indexOf.call(inputs, e.target);
    const nextIndex = index + 1;
  
    if (nextIndex < inputs.length) {
      inputs[nextIndex].focus();
    } else {
      callback(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEnter(e);
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0} className={className}>
      {children}
    </div>
  );
};

export const InputField = ({ type, placeholder, value, onChange, long = false }) => {
  
  return (
      <div className="form-element">
        {long ? (
          <textarea
            className="chat-text-input-box"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{ height: '100px', resize: 'vertical' }}
          />
        ) : (
          <input
            className="chat-text-input-box"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )}
      </div>
  );
};

  
export const Button = ({ text, onClick, hollow = false}) => {
    return (
      <div className={`button expand ${hollow ? 'hollow' : ''}`} onClick={onClick}>
        <div className="button-text">{text}</div>
      </div>
    );
};




import { motion } from 'framer-motion';

export const ErrorBox = ({ message }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const fadeVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  return (
    <motion.div
      className="error-box"
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={fadeVariants}
      transition={{ duration: 0.5 }}
    >
      <div className="error-text">{message}</div>
      <motion.div
        className="error-loading"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 10, ease: 'linear' }}
      />
    </motion.div>
  );
};

  