import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { CalendarDays, ArrowRight, Clock, Terminal, Search, ArrowLeft } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { getPublishedPostsFromDb } from '../lib/db';
import { format } from 'date-fns';
import type { Post } from '../lib/types';

export function DailyLogsPage() {
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

  const allLogs = useMemo(() => {
    return posts
      .filter((p) => p.category === 'Daily Log')
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [posts]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return allLogs;
    const q = search.toLowerCase();
    return allLogs.filter(
      (log) =>
        log.title.toLowerCase().includes(q) ||
        log.excerpt.toLowerCase().includes(q)
    );
  }, [allLogs, search]);

  // Group logs by month-year
  const grouped = useMemo(() => {
    const groups: { label: string; logs: typeof filteredLogs }[] = [];
    const map = new Map<string, typeof filteredLogs>();

    filteredLogs.forEach((log) => {
      const key = format(new Date(log.created_at), 'MMMM yyyy');
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(log);
    });

    map.forEach((logs, label) => {
      groups.push({ label, logs });
    });

    return groups;
  }, [filteredLogs]);

  return (
    <div className="pt-20 md:pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 md:mb-10"
        >
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground mb-4 md:mb-6 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Badge
              variant="secondary"
              className="rounded-lg bg-violet-500/10 text-violet-500 border-violet-500/20 text-xs"
            >
              Daily Log
            </Badge>
          </div>

          <h1 className="!text-2xl sm:!text-3xl md:!text-4xl text-foreground mb-2 md:mb-3">
            Log Harian
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm md:text-lg">
            Catatan kegiatan harian — coding session, debugging, riset, dan
            progress project.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center gap-6 mb-8 md:mb-10 text-xs md:text-sm text-muted-foreground"
        >
          <span>
            <span className="text-foreground">{allLogs.length}</span> total log
          </span>
          {search && (
            <span>
              <span className="text-foreground">{filteredLogs.length}</span>{' '}
              ditemukan
            </span>
          )}
        </motion.div>

        {/* Logs timeline */}
        {filteredLogs.length === 0 ? (
          <div className="text-center py-20">
            <Terminal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {search ? 'Tidak ada log yang cocok.' : 'Belum ada daily log.'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((group, gi) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: gi * 0.05 }}
              >
                {/* Month header */}
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-muted-foreground text-sm tracking-widest uppercase">
                    {group.label}
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                    {group.logs.length} log
                  </span>
                </div>

                {/* Timeline */}
                <div className="relative">
                  {/* Vertical line — desktop only */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-violet-500/40 via-blue-500/20 to-transparent hidden md:block" />

                  <div className="space-y-2.5 md:space-y-4">
                    {group.logs.map((log, i) => {
                      const date = new Date(log.created_at);

                      // Extract sections from content
                      const sections: string[] = [];
                      const h3Regex = /<h3[^>]*>(.*?)<\/h3>/g;
                      let match;
                      while (
                        (match = h3Regex.exec(log.content)) !== null &&
                        sections.length < 3
                      ) {
                        sections.push(match[1].replace(/<[^>]*>/g, ''));
                      }

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                        >
                          <Link
                            to={`/blog/${log.slug}`}
                            className="group flex gap-4 md:gap-6"
                          >
                            {/* Timeline dot — desktop only */}
                            <div className="hidden md:flex flex-col items-center pt-1">
                              <div className="w-[10px] h-[10px] rounded-full bg-violet-500 ring-4 ring-background z-10 group-hover:ring-violet-500/20 transition-all" />
                            </div>

                            {/* Mobile: compact card */}
                            <div className="flex-1 md:hidden flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border/60 hover:border-violet-500/20 transition-all">
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-violet-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-foreground group-hover:text-violet-400 transition-colors line-clamp-1">
                                  {log.title.replace(/^Log Harian\s*[-–—]\s*/i, '')}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{log.excerpt}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[11px] text-violet-400/70">{format(date, 'dd MMM yyyy')}</span>
                                  <span className="text-[11px] text-muted-foreground/60 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {log.reading_time}m
                                  </span>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1" />
                            </div>

                            {/* Desktop: full card */}
                            <div className="hidden md:block flex-1 rounded-xl border border-border bg-card p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
                              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                                    {format(date, 'EEEE, dd MMM yyyy')}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {log.reading_time} min
                                  </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-violet-400 transition-all" />
                              </div>

                              <h3 className="text-foreground mb-2 group-hover:text-violet-400 transition-colors line-clamp-1">
                                {log.title.replace(
                                  /^Log Harian\s*[-–—]\s*/i,
                                  ''
                                )}
                              </h3>

                              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                {log.excerpt}
                              </p>

                              {/* Section tags */}
                              {sections.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {sections.map((sec, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground flex items-center gap-1"
                                    >
                                      <Terminal className="w-2.5 h-2.5" />
                                      {sec.length > 30
                                        ? sec.substring(0, 30) + '...'
                                        : sec}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}