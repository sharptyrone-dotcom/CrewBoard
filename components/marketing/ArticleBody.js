import { Fragment } from 'react';

// Inline bold support: splits a string on **...** and wraps matches in <strong>.
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function renderBlock(block, index) {
  switch (block.type) {
    case 'p':
      return <p key={index}>{renderInline(block.text)}</p>;

    case 'h2':
      return <h2 key={index}>{block.text}</h2>;

    case 'list':
      return (
        <ul key={index} className="article-list">
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol key={index} className="article-steps">
          {block.items.map((item, i) => (
            <li key={i}>
              <h4>{item.title}</h4>
              <p>{renderInline(item.body)}</p>
            </li>
          ))}
        </ol>
      );

    case 'callout': {
      const variant = block.variant === 'tip' ? 'article-callout tip' : 'article-callout note';
      return (
        <div key={index} className={variant}>
          {block.title && <strong>{block.title}</strong>}
          <p>{renderInline(block.text)}</p>
        </div>
      );
    }

    default:
      return null;
  }
}

export default function ArticleBody({ blocks }) {
  return <div className="article-body">{blocks.map(renderBlock)}</div>;
}
