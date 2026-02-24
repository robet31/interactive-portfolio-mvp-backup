import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { FileText, Eye, PenSquare, Clock, Sparkles, CalendarDays, Briefcase, FolderKanban, Award, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getAllPostsFromDb, getAllExperiencesFromDb, getAllProjectsFromDb, getAllCertificationsFromDb } from '../lib/db';
import type { Post, Experience, Project, Certification } from '../lib/types';

export function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [postsData, experiencesData, projectsData, certificationsData] = await Promise.all([
        getAllPostsFromDb(),
        getAllExperiencesFromDb(),
        getAllProjectsFromDb(),
        getAllCertificationsFromDb()
      ]);
      setPosts(postsData);
      setExperiences(experiencesData);
      setProjects(projectsData);
      setCertifications(certificationsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const logs = posts.filter(p => p.category === 'Daily Log').length;
    const totalReadTime = posts.reduce((acc, p) => acc + p.reading_time, 0);
    return { total: posts.length, published, drafts, logs, totalReadTime, experiences: experiences.length, projects: projects.length, certifications: certifications.length };
  }, [posts, experiences, projects, certifications]);

  const allStats = [
    { label: 'Total Articles', value: stats.total, icon: FileText, color: 'text-primary' },
    { label: 'Published', value: stats.published, icon: Eye, color: 'text-emerald-500' },
    { label: 'Drafts', value: stats.drafts, icon: PenSquare, color: 'text-amber-500' },
    { label: 'Daily Logs', value: stats.logs, icon: CalendarDays, color: 'text-violet-500' },
    { label: 'Experiences', value: stats.experiences, icon: Briefcase, color: 'text-cyan-500' },
    { label: 'Certifications', value: stats.certifications, icon: Award, color: 'text-orange-500' },
    { label: 'Projects', value: stats.projects, icon: FolderKanban, color: 'text-pink-500' },
    { label: 'Read Time', value: `${stats.totalReadTime}m`, icon: Clock, color: 'text-blue-500' },
  ];

  // Mobile: show top 4 key stats only
  const mobileStats = allStats.slice(0, 4);

  const recentPosts = posts.slice(0, 5);

  if (loading) {
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="!text-xl md:!text-2xl text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, Api!</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="!text-xl md:!text-2xl text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, Api!</p>
          </div>
          <Link to="/rapi/editor">
            <Button className="gap-2 rounded-xl w-full sm:w-auto">
              <PenSquare className="w-4 h-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Mobile stats — compact 2×2 grid, top 4 only */}
        <div className="md:hidden grid grid-cols-2 gap-2.5 mb-6">
          {mobileStats.map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border">
              <stat.icon className={`w-4 h-4 ${stat.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className="!text-xl text-foreground">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop stats — full 4-col grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-4 mb-8">
          {allStats.map(stat => (
            <div
              key={stat.label}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-muted-foreground truncate">{stat.label}</span>
              </div>
              <p className="!text-3xl text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* AI Log Generator CTA */}
        <div className="rounded-xl border border-border bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-cyan-500/5 p-4 md:p-5 mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-foreground text-sm">AI Log Generator</h3>
                <p className="text-muted-foreground text-xs hidden sm:block">Ceritakan kegiatanmu, AI akan menyusun log harian yang rapi</p>
              </div>
            </div>
            <Link to="/rapi/log-generator">
              <Button size="sm" className="gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                Buat Log
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent posts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 md:p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground text-sm md:text-base">Recent Articles</h3>
            <Link to="/rapi/posts">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs md:text-sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPosts.map(post => (
              <Link
                key={post.id}
                to={`/rapi/editor/${post.id}`}
                className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm md:text-base truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {post.category} &middot; {post.reading_time} min
                  </p>
                </div>
                <span
                  className={`text-[10px] md:text-xs px-2 py-0.5 md:px-2.5 md:py-1 rounded-md ml-3 flex-shrink-0 ${
                    post.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {post.status}
                </span>
              </Link>
            ))}
            {recentPosts.length === 0 && (
              <div className="px-5 py-12 text-center text-muted-foreground">
                No articles yet. Start writing!
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
