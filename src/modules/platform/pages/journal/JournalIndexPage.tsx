// /journal listing. GET /content?kind=journal returns published posts only.
import { ContentIndex } from '@/components/design/ContentIndex'
import { useSeo } from '@/lib/seo'

export function JournalIndexPage() {
  useSeo({
    title: 'The journal',
    description:
      'Plain spoken writing about periods, products, and the people we serve. Field notes, product teardowns, and community stories from the Mensa team.',
  })

  return (
    <ContentIndex
      kind="journal"
      basePath="/journal"
      tones={['stripe', 'cream', 'blush', 'ink']}
      copy={{
        eyebrow: 'From the journal',
        titleLines: [
          'Honest conversations.',
          'Practical tips. Better periods.',
          <>
            For the girlies. <span className="accent">By the girlies.</span>
          </>,
        ],
        lede: 'The Journal is where we share menstrual health tips, reusable product guides, stories from our community, advocacy tips, partnership lessons, and the latest news from Mensa. Everything is written to be helpful, relatable and easy to understand.',
        searchPlaceholder: 'Search the journal…',
        searchLabel: 'Search the journal',
        featureLabel: 'FEATURE',
        emptySearched: (q) => `No journal posts match "${q}".`,
        emptyAll: 'The journal is just getting started.',
        emptyAllBody:
          'We are writing the first pieces now. Check back soon, or subscribe via our footer to get them as they land.',
      }}
    />
  )
}
