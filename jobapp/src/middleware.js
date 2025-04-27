import { NextResponse } from 'next/server';

export function middleware(request) {
  // Log để dễ debug
  console.log('Middleware processing path:', request.nextUrl.pathname);
  
  // Cho phép mọi request đi qua mà không kiểm tra quyền
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho một số đường dẫn cơ bản
// Loại trừ các assets tĩnh để tránh ảnh hưởng hiệu suất
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 