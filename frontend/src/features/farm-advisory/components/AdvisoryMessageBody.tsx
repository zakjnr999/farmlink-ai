'use client';

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-${index}`} className="font-semibold text-field-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

interface AdvisoryMessageBodyProps {
  content: string;
  className?: string;
}

export function AdvisoryMessageBody({ content, className }: AdvisoryMessageBodyProps) {
  const blocks = content.split('\n\n');

  return (
    <div className={className}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n');
        return (
          <div key={blockIndex} className={blockIndex > 0 ? 'mt-3' : undefined}>
            {lines.map((line, lineIndex) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('• ')) {
                return (
                  <p key={lineIndex} className="ml-1 text-sm leading-relaxed">
                    {renderInline(trimmed, `${blockIndex}-${lineIndex}`)}
                  </p>
                );
              }

              return (
                <p
                  key={lineIndex}
                  className={lineIndex > 0 ? 'mt-1.5 text-sm leading-relaxed' : 'text-sm leading-relaxed'}
                >
                  {renderInline(trimmed, `${blockIndex}-${lineIndex}`)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
