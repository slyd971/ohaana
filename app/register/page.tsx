import { redirect } from 'next/navigation'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function toQueryString(params: Awaited<SearchParams>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (key === 'role') {
      const role = Array.isArray(value) ? value[0] : value
      if (role !== 'tourist' && role !== 'provider') continue
    }

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item))
    } else if (value !== undefined) {
      query.set(key, value)
    }
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

export default async function RegisterRedirect({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  redirect(`/fr/register${toQueryString(await searchParams)}`)
}
