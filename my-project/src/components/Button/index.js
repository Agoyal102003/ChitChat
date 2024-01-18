import React from 'react';
import PropTypes from 'prop-types';

const Button = (
    {
        label= 'Button',
        type= 'button',
        className='',
        disabled=false,
    }
) => {
    return (
        <button type={type} className={`text-white bg-primary hover:bg-primary focus:ring-4 
        focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5
         text-center ${className}`} disabled={disabled}>{label}</button>
    )
}

Button.propTypes = {
    label: PropTypes.string,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

export default Button;