
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // No custom props needed for this simple version
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
 const style: React.CSSProperties = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    width: 'calc(100% - 22px)', // Adjust width considering padding and border
    marginBottom: '10px',
    boxSizing: 'border-box'
  };
  return (
    <input style={style} className={className || ''} {...props} />
  );
};

export default Input;
