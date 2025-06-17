
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  // Simple inline styles or use with Tailwind/CSS Modules. For demo, inline:
  const style: React.CSSProperties = {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'white',
    fontWeight: 'bold',
    opacity: props.disabled ? 0.6 : 1,
  };

  switch (variant) {
    case 'primary':
      style.backgroundColor = '#007bff';
      break;
    case 'secondary':
      style.backgroundColor = '#6c757d';
      break;
    case 'success':
      style.backgroundColor = '#28a745';
      break;
    case 'danger':
      style.backgroundColor = '#dc3545';
      break;
    default:
      style.backgroundColor = '#007bff';
  }

  return (
    <button style={style} className={className || ''} {...props}>
      {children}
    </button>
  );
};

export default Button;
