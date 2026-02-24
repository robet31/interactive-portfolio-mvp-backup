import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  Eye,
  ArrowLeft,
  Upload,
  LinkIcon,
  X,
  ChevronDown,
  Keyboard,
  Info,
  ImageIcon,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { TipTapEditor } from '../components/dashboard/tiptap-editor';
import { createPostInDb, updatePostInDb, getAllPostsFromDb } from '../lib/db';
import { generateLogEntry } from '../lib/ai-service';
import type { PostCategory, Post } from '../lib/types';
import { toast } from 'sonner';

const CATEGORIES: PostCategory[] = [
  'Data Science',
  'Web Development',
  'IT Audit & COBIT',
  'Jurnal & Catatan',
  'Daily Log',
];

// ─── Collapsible Section ───
function CollapsibleSection({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="text-sm text-foreground flex-1">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cover Image Picker ───
function CoverImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [mode, setMode] = useState<'upload' | 'url'>(value && !value.startsWith('data:') ? 'url' : 'upload');
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value && value.startsWith('data:')) {
      setMode('upload');
    } else if (value && !value.startsWith('data:')) {
      setMode('url');
      setUrlInput(value);
    }
  }, [value]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  return (
    <div className="space-y-3">
      <Label>Cover Image</Label>

      {/* Mode tabs */}
      <div className="flex bg-muted/50 rounded-lg p-0.5 gap-0.5">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
            mode === 'upload'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors ${
            mode === 'url'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          URL
        </button>
      </div>

      {mode === 'upload' ? (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-xs text-foreground">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="https://images.unsplash.com/..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            className="rounded-lg text-sm flex-1"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUrlSubmit}
            className="rounded-lg shrink-0 px-3"
          >
            Set
          </Button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative group rounded-lg overflow-hidden aspect-video bg-muted">
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Shortcut Key Component ───
function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
      {children}
    </kbd>
  );
}

// ═══════════════════════════════════════════════════
// Main Editor Page
// ═══════════════════════════════════════════════════
export function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState<PostCategory>('Jurnal & Catatan');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // AI Content Generation using OpenRouter
  const generateContent = useCallback(async (): Promise<string> => {
    if (!title.trim()) {
      toast.error('Please enter a title first');
      return '';
    }

    setGenerating(true);

    try {
      const categoryContext = CATEGORIES.includes(category) ? category : 'Jurnal & Catatan';
      const now = new Date();
      const timestamp = now.toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' - ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const hasExistingContent = content.trim().length > 0;
      const userContentPreview = hasExistingContent ? content.slice(0, 800) : '';

      const prompt = `Kamu adalah AI LogBot yang membantu membuat artikel/blog yang casual, personal, dan relatable. Like sharing knowledge with a friend!

⏰ WAKTU: ${timestamp}
📂 KATEGORI: ${categoryContext}

📝 TOPIK ARTIKEL: ${title}

${hasExistingContent ? `📄 TULISAN USER YANG SUDAH ADA (PERTAMBAHKAN & KEMBANGKAN):
"${userContentPreview}"

⚠️ INSTRUKSI: Lanjutkan dan kembangkan tulisan user di atas dengan detail!` : '📄 TULISAN: Buat artikel baru'}

ATURAN:
1. Bahasa Indonesia casual dan relatable - seperti ngobrol sama teman
2. Pakai ekspresi: "sebenarnya", "awalnya bingung", "setelah coba-coba", "eh ternyata", "alhasil", "kebetulan"
3. Tunjukkan proses berpikir: "awalnya aku ragu", "setelah oprek-oprek", "eh siapa sangka"
4. Struktur HTML: <h2> judul, <h3> subjudul, <p> paragraf, <ul>/<ol> list, <blockquote> catatan penting
5. Coding: <pre><code class="language-javascript">// code</code></pre>
6. Gambar: <blockquote><p><strong>📸 INSERT IMAGE:</strong> [deskripsi]</p></blockquote>
7. Akhiri dengan "Catatan & To-Do"

${hasExistingContent ? 'Kembangkan tulisan user yang sudah ada!' : 'Buat artikel yang menarik!'}`;

      const generated = await generateLogEntry(
        [{ role: 'user', content: prompt }],
        undefined,
        undefined
      );

      setGenerating(false);
      return generated || '';
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content. Please try again.');
      setGenerating(false);
      return '';
    }
  }, [title, category, content]);

  const handleGenerate = useCallback(async () => {
    const generated = await generateContent();
    if (generated) {
      setContent(generated);
      toast.success('Content generated by AI!');
    }
  }, [generateContent]);

  useEffect(() => {
    if (isEditing && id) {
      async function loadPost() {
        const posts = await getAllPostsFromDb();
        const post = posts.find(p => p.id === id);
        if (post) {
          setTitle(post.title);
          setExcerpt(post.excerpt);
          setCoverUrl(post.cover_image_url);
          setCategory(post.category);
          setContent(post.content);
        }
      }
      loadPost();
    }
  }, [id, isEditing]);

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (coverUrl && coverUrl.startsWith('data:')) {
      const base64Size = coverUrl.length * (3/4);
      if (base64Size > 4 * 1024 * 1024) {
        toast.error('Cover image is too large. Please use a smaller image (max ~4MB base64).');
        return;
      }
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const data = {
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      excerpt,
      cover_image_url: coverUrl,
      category,
      content,
      status,
      reading_time: Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)),
    };

    if (isEditing) {
      const updated = await updatePostInDb(id, data);
      if (updated) {
        toast.success(status === 'published' ? 'Article published!' : 'Draft saved!');
      } else {
        toast.error('Failed to save article');
      }
    } else {
      const newPost = await createPostInDb(data);
      if (newPost) {
        toast.success(status === 'published' ? 'Article published!' : 'Draft saved!');
        navigate(`/rapi/editor/${newPost.id}`, { replace: true });
      } else {
        toast.error('Failed to create article');
      }
    }

    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/rapi/posts')}
            className="rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="!text-xl sm:!text-2xl text-foreground">
            {isEditing ? 'Edit Article' : 'New Article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{generating ? 'Generating...' : 'Generate'}</span>
            <span className="sm:hidden">{generating ? '...' : 'AI'}</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-sm"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </Button>
          <Button
            className="gap-2 rounded-xl text-sm"
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            <Eye className="w-4 h-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,280px] xl:grid-cols-[1fr,300px] gap-5">
        {/* ─── Editor Column ─── */}
        <div className="space-y-4 min-w-0">
          <Input
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="!text-xl sm:!text-2xl border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 rounded-none"
          />
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        {/* ─── Sidebar Column ─── */}
        <div className="space-y-3">
          {/* Metadata card */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <h3 className="text-sm text-foreground">Metadata</h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
                <SelectTrigger className="rounded-lg h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Excerpt</Label>
              <Textarea
                placeholder="Brief description..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="rounded-lg resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Cover Image Picker */}
            <CoverImagePicker value={coverUrl} onChange={setCoverUrl} />
          </div>

          {/* Keyboard shortcuts - collapsible */}
          <CollapsibleSection icon={Keyboard} title="Keyboard Shortcuts">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
              {[
                ['Bold', 'Ctrl+B'],
                ['Italic', 'Ctrl+I'],
                ['Code', 'Ctrl+E'],
                ['Heading', 'Ctrl+Alt+1-3'],
                ['List', 'Ctrl+Shift+8'],
                ['Quote', 'Ctrl+Shift+B'],
                ['Code Block', 'Ctrl+Alt+C'],
                ['Align Left', 'Ctrl+Shift+L'],
                ['Align Center', 'Ctrl+Shift+E'],
                ['Align Right', 'Ctrl+Shift+R'],
                ['Justify', 'Ctrl+Shift+J'],
                ['Undo', 'Ctrl+Z'],
              ].map(([label, shortcut]) => (
                <div key={label} className="flex items-center justify-between py-0.5">
                  <span className="truncate mr-1">{label}</span>
                  <Kbd>{shortcut}</Kbd>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Tips - collapsible */}
          <CollapsibleSection icon={Info} title="Tips">
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p>
                Type <Kbd>/</Kbd> on an empty line for slash commands.
              </p>
              <p>
                Use the <strong className="text-foreground">+</strong> button on empty lines to insert blocks.
              </p>
              <p>
                <strong className="text-foreground">Drag & drop</strong> or{' '}
                <strong className="text-foreground">paste</strong> images directly into the editor.
              </p>
              <p>
                <strong className="text-foreground">Click an image</strong> to align it (left/center/right), resize, or wrap text around it.
              </p>
              <p>
                Select text to see the inline formatting bubble menu.
              </p>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </motion.div>
  );
}