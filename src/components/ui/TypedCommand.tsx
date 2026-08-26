'use client';

import React, { useEffect, useState } from 'react';

interface TypedCommandProps {
  command: string;
  speed?: number;
  delay?: number;
  className?: string;
  prefix?: string;
}

export function TypedCommand({
  command,
  speed = 40,
  delay = 200,
  className = '',
  prefix = '>',
}: TypedCommandProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const startTyping = () => {
      setIsTyping(true);
      const interval = setInterval(() => {
        if (charIndex < command.length) {
          setDisplayedText(command.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);
    };

    timeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [command, speed, delay]);

  return (
    <div className={`font-mono text-terminal-green flex items-center gap-2 ${className}`}>
      <span className="text-terminal-muted select-none">{prefix}</span>
      <span>{displayedText}</span>
      <span className="w-2.5 h-4 bg-terminal-green inline-block animate-blink"></span>
    </div>
  );
}
