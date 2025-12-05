import React from 'react';

export function IconBtn({ onClick, disabled, Icon, ariaLabel, children, isActive, color }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={`icon-btn ${isActive ? 'active' : ''} ${color ? color : ''}`}
        >
            <Icon />
            {children}
        </button>
    );
}
