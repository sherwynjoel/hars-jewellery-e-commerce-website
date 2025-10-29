import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname

      // Require authentication for matched routes
      if (!token) return false

      // Admin-only access for admin pages and APIs
      if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        return token.role === 'ADMIN'
      }

      return true
    }
  }
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}


