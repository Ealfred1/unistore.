import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname
  
  // Check if the path is a dashboard route
  const isDashboardRoute = path.startsWith('/dashboard')
  
  // For server-side middleware, we can't access localStorage directly
  // Instead, we need to check for the token in the request cookies
  // The token should be set as a cookie when stored in localStorage
  const token = request.cookies.get('access_token')?.value
  
  // If it's a dashboard route and there's no token, redirect to login
  if (isDashboardRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // If it's the my-products route, check if user is a merchant
  if (path.startsWith('/dashboard/my-products')) {
    // Get user data from cookies
    const userData = request.cookies.get('user')?.value
    
    if (userData) {
      try {
        const user = JSON.parse(userData)
        
        // If user is not a merchant, redirect to dashboard
        if (user.user_type !== 'MERCHANT') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
        // If there's an error parsing user data, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } else {
      // If there's no user data, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}     