'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/types/news';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ReactionButton } from './ReactionButton';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  isAdmin: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onModerate?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  onModerate,
}: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = post.authorId === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.authorPhotoURL || undefined} />
              <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.createdAt)}
                {post.isEdited && (
                  <span className="ml-1 italic">(editado)</span>
                )}
              </p>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(post)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-4">
          <ReactionButton
            targetType="post"
            targetId={post.id}
            currentUserId={currentUserId}
            initialCount={post.reactionCount}
            initialUserReacted={false}
          />

          <Link href={`/noticias/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{post.commentCount}</span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
