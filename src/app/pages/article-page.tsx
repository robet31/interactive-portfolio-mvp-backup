import { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArticleRenderer } from '../components/blog/article-renderer';
import { TableOfContents } from '../components/blog/table-of-contents';
import { getPostBySlugFromDb, getPublishedPostsFromDb } from '../lib/db';
import { BlogCard } from '../components/blog/blog-card';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { format } from 'date-fns';
import type { Post } from '../lib/types';

export function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function loadData() {
      if (slug) {
        const postData = await getPostBySlugFromDb(slug);
        setPost(postData);
        
        if (postData) {
          const allPosts = await getPublishedPostsFromDb();
          const related = allPosts
            .filter(p => p.id !== postData.id && p.category === postData.category)
            .slice(0, 2);
          setRelatedPosts(related);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="!text-6xl text-foreground mb-4">404</h1>
          <p className="text-muted-foreground text-lg mb-6">Article not found</p>
          <Link to="/blog">
            <Button variant="outline" className="rounded-xl gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link to="/blog">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="secondary" className="rounded-lg">
            {post.category}
          </Badge>
          {post.status === 'draft' && (
            <Badge variant="outline" className="rounded-lg border-amber-500/50 text-amber-600">
              Draft
            </Badge>
          )}
          <span className="text-muted-foreground text-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {format(new Date(post.created_at), 'dd MMMM yyyy')}
          </span>
        </div>

        <h1 className="!text-3xl sm:!text-4xl md:!text-5xl text-foreground !leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed">
          {post.excerpt}
        </p>
      </motion.div>

      {/* Cover image */}
      {post.cover_image_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-5xl mx-auto px-6 mb-12"
        >
          <div className="rounded-2xl overflow-hidden aspect-[21/9]">
            <ImageWithFallback
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      )}

      {/* Article content + TOC layout */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex gap-8 justify-center">
          {/* Article body */}
          <motion.article
            ref={articleRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl min-w-0 flex-1"
          >
            <ArticleRenderer content={post.content} />
          </motion.article>

          {/* TOC sidebar (desktop) */}
          <TableOfContents contentRef={articleRef} />
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 mt-20">
          <div className="border-t border-border pt-12">
            <h3 className="text-foreground mb-8">Related Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}