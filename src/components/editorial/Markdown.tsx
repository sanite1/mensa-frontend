// Markdown — minimal subset renderer for ContentPost bodies.

type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[] }

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line) {
      i += 1
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', text: line.slice(3).trim() })
      i += 1
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: line.slice(4).trim() })
      i += 1
      continue
    }
    if (line.startsWith('# ')) {
      // Single-hash treated as h2 since the page already renders an h1
      // from post.title.
      blocks.push({ kind: 'h2', text: line.slice(2).trim() })
      i += 1
      continue
    }
    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2).trim())
        i += 1
      }
      blocks.push({ kind: 'list', items })
      continue
    }
    // Greedy paragraph: take consecutive non-empty lines that aren't
    // a block marker. Single newlines inside a paragraph collapse to spaces.
    const paraLines: string[] = [line]
    i += 1
    while (i < lines.length) {
      const next = lines[i].trim()
      if (
        !next ||
        next.startsWith('## ') ||
        next.startsWith('### ') ||
        next.startsWith('# ') ||
        next.startsWith('- ')
      ) {
        break
      }
      paraLines.push(next)
      i += 1
    }
    blocks.push({ kind: 'p', text: paraLines.join(' ') })
  }
  return blocks
}

/** Inline markdown: **bold** and *italic*. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source)
  // Rendered inside the design system's .prose block, which styles the tags.
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        if (b.kind === 'h2') return <h2 key={i}>{b.text}</h2>
        if (b.kind === 'h3') return <h3 key={i}>{b.text}</h3>
        if (b.kind === 'list') {
          return (
            <ul key={i} className="list-disc">
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return <p key={i}>{renderInline(b.text)}</p>
      })}
    </div>
  )
}
