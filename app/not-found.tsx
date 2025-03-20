import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-16 text-center">
      <div className="relative mb-8">
        <div className="text-9xl font-bold opacity-10">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">页面未找到</h1>
        </div>
      </div>
      
      <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-lg mb-8">
        抱歉，您请求的页面不存在或已被移除。
      </p>
      
      <Link 
        href="/" 
        className="btn-primary inline-flex items-center"
      >
        <HomeIcon className="h-5 w-5 mr-2" />
        返回首页
      </Link>
    </div>
  );
} 