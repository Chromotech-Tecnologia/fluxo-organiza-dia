import React from 'react';

interface LinkifyTextProps {
  text: string;
  className?: string;
}

// Regex para detectar URLs
const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;

export function LinkifyText({ text, className = '' }: LinkifyTextProps) {
  if (!text) return null;

  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          // Reset regex lastIndex
          urlRegex.lastIndex = 0;
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

// Componente para renderizar texto multilinha com links
export function LinkifyMultilineText({ text, className = '' }: LinkifyTextProps) {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          <LinkifyText text={line} />
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
}
