import React from 'react';
import { cn } from '@/lib/utils.js';

const Action = ({
  color,
  bg,
  size,
  fontSize,
  fontWeight,
  isDisabled,
  isLoading,
  children,
  block,
  icon,
  label,
  className,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={cn(
        'flex items-center justify-center rounded-md px-3 py-1.5 transition-colors duration-150',
        block ? 'w-full' : 'inline-flex',
        size === 'small' ? 'h-7' : size === 'large' ? 'h-11' : 'h-8',
        bg ? bg : '',
        color ? color : '',
        fontWeight ? fontWeight : 'font-medium',
        fontSize ? fontSize : 'text-sm',
        className
      )}
      disabled={isDisabled}
    >
      {isLoading ? (
        '...'
      ) : (
        <>
          {icon && <i className={cn(icon, 'mr-2 text-base')} />}
          {label && <span>{label}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Action;
