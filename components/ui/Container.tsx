import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'small' | 'large' | 'full';
  as?: 'div' | 'section' | 'article' | 'main';
}

const sizeClasses = {
  default: 'max-w-7xl',
  small: 'max-w-3xl',
  large: 'max-w-[90rem]',
  full: 'max-w-full',
};

export function Container({
  children,
  className = '',
  size = 'default',
  as: Component = 'div',
}: ContainerProps) {
  return (
    <Component className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${sizeClasses[size]} ${className}`}>
      {children}
    </Component>
  );
}