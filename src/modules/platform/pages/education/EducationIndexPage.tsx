// /education listing, same data model as the journal but with kind=education.
import { ContentIndex } from '@/components/design/ContentIndex'
import { useSeo } from '@/lib/seo'

export function EducationIndexPage() {
  useSeo({
    title: 'Education library',
    description:
      'Care guides for your reusables, classroom resources for teachers, and clear judgement-free reading on menstrual health. Free to read and share.',
  })

  return (
    <ContentIndex
      kind="education"
      basePath="/education"
      tones={['cream', 'blush', 'stripe', 'ink']}
      copy={{
        kicker: (count) => (
          <>
            Education · For girls, parents, and teachers
            {count > 0 ? ` · ${count} guide${count === 1 ? '' : 's'}` : ''}
          </>
        ),
        eyebrow: 'The library',
        titleLines: ['Plain answers', 'to the questions girls', 'actually ask.'],
        lede: 'Care guides for your reusables, classroom resources for teachers, and clear, judgement-free reading on menstrual health. Free for anyone to read and share.',
        searchPlaceholder: 'Search the library…',
        searchLabel: 'Search education guides',
        featureLabel: 'GUIDE',
        emptySearched: (q) => `No guides match "${q}".`,
        emptyAll: 'The library is coming together.',
        emptyAllBody:
          'We are publishing the first guides now. Care guides for your reusables and classroom resources are on the way.',
      }}
    />
  )
}
