import { redirect } from 'next/navigation'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function toQueryString(params: Awaited<SearchParams>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item))
    } else if (value !== undefined) {
      query.set(key, value)
    }
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export default async function LoginRedirect({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  redirect(`/fr/login${toQueryString(await searchParams)}`)
}
