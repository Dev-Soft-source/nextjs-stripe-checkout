import { NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'
import {
  fallbackLng,
  languages,
  supportedLanguageList,
  cookieName,
  headerName,
} from './i18n/settings'

acceptLanguage.languages(supportedLanguageList)

export const config = {
  // matcher: '/:lng*'
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)']
}

function isPublicStaticPath(pathname) {
  if (pathname.startsWith('/plants/')) return true
  if (pathname === '/leaf.svg' || pathname === '/favicon.ico') return true
  return /\.(svg|png|jpe?g|gif|webp|ico|woff2?|ttf|eot)$/i.test(pathname)
}

export function proxy(req) {
  const pathname = req.nextUrl.pathname
  if (pathname.indexOf('icon') > -1 || pathname.indexOf('chrome') > -1) return NextResponse.next()
  if (isPublicStaticPath(pathname)) return NextResponse.next()
  let lng
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName).value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  const lngInPath = languages.find(loc => req.nextUrl.pathname.startsWith(`/${loc}`))
  const headers = new Headers(req.headers)
  headers.set(headerName, lngInPath || lng)

  // Redirect if lng in path is not supported
  if (
    !lngInPath &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}${req.nextUrl.search}`, req.url))
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer'))
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
    const response = NextResponse.next({ headers })
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next({ headers })
}
