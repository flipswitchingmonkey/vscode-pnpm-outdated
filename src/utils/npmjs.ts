import { ofetch, FetchError } from 'ofetch'
import { isNpmjsResponse, NpmjsResponse, Result } from '../types'

export async function fetchPackageInfo(packageName: string, packageVersion?: string): Promise<Result<NpmjsResponse>> {
  let url = `https://registry.npmjs.org/${packageName}`
  if (packageVersion) url = `${url}/${packageVersion}`
  let fetchError: FetchError | undefined
  const fetchResult = await ofetch(url, {
    method: 'GET',
    parseResponse: JSON.parse,
  }).catch((error: FetchError) => {
    console.log(error)
    fetchError = error
    // console.log(error.data)
  })
  console.log(url, isNpmjsResponse(fetchResult), fetchResult)
  if (fetchResult && isNpmjsResponse(fetchResult)) {
    return {
      ok: true,
      value: fetchResult,
    }
  }
  return {
    ok: false,
    error: fetchError ?? new Error(`error fetching ${url}`),
  }
}
