import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 需要认证的路由
const protectedRoutes = [
  '/profile',
  '/dashboard',
  '/settings',
];

// 公开路由（无需认证）
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // API 路由不在中间件中处理
  if (path.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // 检查用户是否已认证
  const token = await getToken({ req });
  const isAuthenticated = !!token;
  
  // 如果访问受保护的路由但未认证，重定向到登录页面
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', encodeURI(path));
    return NextResponse.redirect(url);
  }
  
  // 如果已认证但访问公开路由（如登录页面），重定向到首页
  if (publicRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  
  return NextResponse.next();
}

// 配置匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - API 路由
     * - 静态文件（如图片、JS、CSS等）
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 