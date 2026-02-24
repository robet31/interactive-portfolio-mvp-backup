import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { BlogCard } from '../components/blog/blog-card';
import { CategoryFilter } from '../components/blog/category-filter';
import { getPublishedPostsFromDb } from '../lib/db';
import type { Post } from '../lib/types';

export function BlogPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const data = await getPublishedPostsFromDb();
      setPosts(data);
      setLoading(false);
    }
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = posts;
    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    return filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [posts, category, search]);

  const [featured, ...rest] = filteredPosts;

  if (loading) {
    return (
      <div className="pt-20 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="!text-2xl sm:!text-4xl md:!text-5xl text-foreground mb-3 md:mb-4">
            Blog & Dokumentasi
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl">
            Catatan teknis, tutorial, dan dokumentasi proyek. Dari data science
            hingga web development dan audit IT.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <CategoryFilter active={category} onChange={setCategory} />
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card"
            />
          </div>
        </motion.div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No articles found.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Try changing your filters or search query.
            </p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {/* Featured post */}
            {featured && <BlogCard post={featured} featured index={0} />}

            {/* Rest of posts */}
            {rest.length > 0 && (
              <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {rest.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}