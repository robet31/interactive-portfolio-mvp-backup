import { useState } from 'react';
import { Link } from 'react-router';
import { Edit, Trash2, Eye, MoreHorizontal, Calendar, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import type { Post } from '../../lib/types';
import { deletePostInDb, updatePostInDb } from '../../lib/db';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ArticleTableProps {
  posts: Post[];
  onRefresh: () => void;
}

export function ArticleTable({ posts, onRefresh }: ArticleTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string>('');

  const handleDelete = async () => {
    if (deleteId) {
      const result = await deletePostInDb(deleteId);
      if (result) {
        toast.success('Post deleted');
      } else {
        toast.error('Failed to delete post');
      }
      setDeleteId(null);
      onRefresh();
    }
  };

  const toggleStatus = async (post: Post) => {
    const result = await updatePostInDb(post.id, {
      status: post.status === 'published' ? 'draft' : 'published',
    });
    if (result) {
      toast.success(result.status === 'published' ? 'Post published' : 'Post moved to drafts');
    } else {
      toast.error('Failed to update status');
    }
    onRefresh();
  };

  const handleStartEditDate = (post: Post) => {
    setEditingDateId(post.id);
    setEditingDate(post.created_at.split('T')[0]);
  };

  const handleSaveDate = async () => {
    if (editingDateId && editingDate) {
      const result = await updatePostInDb(editingDateId, {
        created_at: new Date(editingDate).toISOString(),
      });
      if (result) {
        toast.success('Date updated');
      } else {
        toast.error('Failed to update date');
      }
      setEditingDateId(null);
      onRefresh();
    }
  };

  const handleCancelDateEdit = () => {
    setEditingDateId(null);
  };

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[40%]">Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No articles yet. Create your first post!
                </TableCell>
              </TableRow>
            ) : (
              posts.map(post => (
                <TableRow key={post.id} className="group">
                  <TableCell>
                    <div>
                      <p className="text-foreground truncate max-w-xs">
                        {post.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                        /{post.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="rounded-md text-xs">
                      {post.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => toggleStatus(post)}>
                      <Badge
                        className={`rounded-md text-xs cursor-pointer ${
                          post.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0'
                            : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0'
                        }`}
                      >
                        {post.status}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {editingDateId === post.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          value={editingDate}
                          onChange={(e) => setEditingDate(e.target.value)}
                          className="text-xs border rounded px-1 py-0.5 bg-background"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-emerald-500"
                          onClick={handleSaveDate}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCancelDateEdit}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditDate(post)}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        <span className="text-sm">{format(new Date(post.created_at), 'dd MMM yyyy')}</span>
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={post.status === 'published' ? 'View Article' : 'Preview Draft'}
                        asChild
                      >
                        <Link to={`/blog/${post.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/rapi/editor/${post.id}`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(post.id)}
                            className="text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}