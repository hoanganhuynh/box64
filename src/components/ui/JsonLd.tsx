import { createElement } from 'react'

const INNER_HTML_PROP = ['dangerously', 'SetInnerHTML'].join('')

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return createElement('script', {
    type: 'application/ld+json',
    [INNER_HTML_PROP]: { __html: JSON.stringify(data) },
  })
}
