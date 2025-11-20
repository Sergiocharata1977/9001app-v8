'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Share2,
  Eye,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ReactionButton } from '../interactions/ReactionButton';
import { ShareButton } from '../interactions/ShareButton';
import { ImageGallery } from '../media/ImageGallery';
import { animations } from '../utils/animations';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Date;
  updatedAt?: Date;
  images?: Array<{ id: string; url: string; alt?: string }>;
  reactionCount: number;
  commentCount: number;
  userReacted: boolean;
  isEdited?: boolean;
  views?: number;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  isAdmin: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReaction?: (
    postId: string,
    reactionType: string,
    hasReacted: boolean
  ) => Promise<void>;
  variant?: 'default' | 'compact' | 'featured';
  showMetrics?: boolean;
  className?: string;
}

export function PostCard({
  post,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  onReaction,
  variant = 'default',
  showMetrics = true,
  className = '',
}: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isAuthor = post.authorId === currentUserId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    try {
      await onDelete?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
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

  const formatDate = (timestamp: Date) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true, locale: es });
    } catch {
      return 'Hace un momento';
    }
  };

  const cardVariants = {
    default: 'w-full',
    compact: 'w-full max-w-md',
    featured: 'w-full max-w-2xl mx-auto',
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      variants={animations.cardHover}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cardVariants[variant]}
    >
      <Card
        className={`transition-all duration-200 border-slate-200 hover:border-emerald-200 hover:shadow-lg ${className}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-emerald-100">
                <AvatarImage src={post.authorPhotoURL} />
                <AvatarFallback className="bg-emerald-600 text-white">
                  {getInitials(post.authorName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {post.authorName}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-xs border-emerald-200 text-emerald-700"
                  >
                    ISO 9001
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(post.createdAt)}</span>
                  {post.isEdited && (
                    <span className="text-xs italic">(editado)</span>
                  )}
                  {showMetrics && post.views && (
                    <>
                      <span>•</span>
                      <Eye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {(canEdit || canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Post Content */}
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Images Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-slate-200">
              <ImageGallery
                images={post.images}
                maxDisplay={4}
                className="rounded-none"
              />
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <ReactionButton
                targetType="post"
                targetId={post.id}
                currentUserId={currentUserId}
                initialCount={post.reactionCount}
                initialUserReacted={post.userReacted}
                onReaction={onReaction}
                variant="compact"
              />

              <Link href={`/noticias/${post.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{post.commentCount}</span>
                </Button>
              </Link>
            </div>

            <ShareButton
              postId={post.id}
              postTitle={post.content.substring(0, 50) + '...'}
              variant="compact"
            />
          </div>

          {/* Hover Effects */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-2 border"
            >
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
