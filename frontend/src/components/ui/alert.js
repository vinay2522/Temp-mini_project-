import React from 'react';
import PropTypes from 'prop-types';
import './alert.css'; // Make sure to create a corresponding CSS file for styling

const Alert = ({ children, className }) => {
    return (
        <div className={`alert ${className}`}>
            {children}
        </div>
    );
};

Alert.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};

const AlertTitle = ({ children }) => {
    return (
        <div className="alert-title">
            {children}
        </div>
    );
};

AlertTitle.propTypes = {
    children: PropTypes.node.isRequired,
};

const AlertDescription = ({ children }) => {
    return (
        <div className="alert-description">
            {children}
        </div>
    );
};

AlertDescription.propTypes = {
    children: PropTypes.node.isRequired,
};

export { Alert, AlertTitle, AlertDescription };