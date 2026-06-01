// ═══════════════════════════════════════════════════════════════
// Markdown — minimal subset renderer for ContentPost bodies.
//
// We parse a small slice of markdown by hand to avoid a dependency
// for our launch content set: # / ## / ### headings, blank-line
// paragraph breaks, unordered lists (`- `), inline **bold** and
// *italic*. Anything else renders as a plain paragraph. Swap for
// `react-markdown` if the body content grows complex enough to
// need tables, code blocks, or images.
// ═══════════════════════════════════════════════════════════════

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
          return (
            <strong key={i} className="text-ink font-semibold">
              {part.slice(2, -2)}
            </strong>
          )
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
  return (
    <div className="flex flex-col gap-6 text-ink">
      {blocks.map((b, i) => {
        if (b.kind === 'h2') {
          return (
            <h2
              key={i}
              className="m-0 font-display italic font-semibold text-[clamp(24px,3vw,36px)] leading-tight tracking-tight text-ink mt-6"
            >
              {b.text}
            </h2>
          )
        }
        if (b.kind === 'h3') {
          return (
            <h3 key={i} className="m-0 text-[20px] font-semibold text-ink mt-4">
              {b.text}
            </h3>
          )
        }
        if (b.kind === 'list') {
          return (
            <ul key={i} className="m-0 pl-5 flex flex-col gap-2 t-body-l text-graphite">
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="m-0 t-body-l text-graphite leading-[1.7]">
            {renderInline(b.text)}
          </p>
        )
      })}
    </div>
  )
}
