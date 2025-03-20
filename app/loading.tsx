export default function Loading() {
  return (
    <div className="container flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-neutral-200 dark:border-neutral-700 border-t-primary-500 dark:border-t-primary-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">加载中...</p>
      </div>
    </div>
  );
} 