import Link from 'next/link';
import Image from 'next/image';
import { formatDate, truncateText } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    publishedAt: string;
    author: {
      name: string;
      image?: string;
    };
    category?: string;
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
      {post.coverImage && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex-1">
          {post.category && (
            <p className="text-xs font-medium uppercase text-primary">
              {post.category}
            </p>
          )}
          <Link href={`/blog/${post.slug}`} className="mt-2 block">
            <h3 className="text-xl font-semibold leading-tight text-foreground hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {truncateText(post.excerpt, 120)}
            </p>
          </Link>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            {post.author.image ? (
              <Image
                className="h-10 w-10 rounded-full"
                src={post.author.image}
                alt={post.author.name}
                width={40}
                height={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {post.author.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {post.author.name}
            </p>
            <div className="flex space-x-1 text-xs text-muted-foreground">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 