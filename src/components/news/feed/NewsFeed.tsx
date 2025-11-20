'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PostCard } from './PostCard';
import { PostComposer } from './PostComposer';
import { LoadMoreButton } from './LoadMoreButton';
import { useNewsFeed } from '../utils/hooks/useNewsFeed';
import { validatePostContent } from '../utils/validations';
import { animations } from '../utils/animations';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewsFeedProps {
  organizationId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserPhotoURL?: string;
  isAdmin: boolean;
  className?: string;
}

export function NewsFeed({
  organizationId,
  currentUserId,
  currentUserName,
  currentUserPhotoURL,
  isAdmin,
  className = '',
}: NewsFeedProps) {
  const [showComposer, setShowComposer] = useState(false);

  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    addPost,
    updatePost,
    removePost,
  } = useNewsFeed({
    organizationId,
    currentUserId,
  });

  const handleCreatePost = async (content: string, files: File[]) => {
    // Validate content
    const validation = validatePostContent(content, files);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    try {
      // Here you would typically call an API to create the post
      // For now, we'll simulate it
      const newPost = {
        id: `temp-${Date.now()}`,
        content,
        authorId: currentUserId,
        authorName: currentUserName,
        authorPhotoURL: currentUserPhotoURL,
        createdAt: new Date(),
        images: files
          .filter(file => file.type.startsWith('image/'))
          .map(file => ({
            id: `img-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(file),
            alt: file.name,
          })),
        reactionCount: 0,
        commentCount: 0,
        userReacted: false,
      };

      addPost(newPost);
      setShowComposer(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear la publicación');
    }
  };

  const handleReaction = async (
    postId: string,
    reactionType: string,
    hasReacted: boolean
  ) => {
    try {
      // Update local state optimistically
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePost(postId, {
          reactionCount: hasReacted
            ? post.reactionCount + 1
            : Math.max(0, post.reactionCount - 1),
          userReacted: hasReacted,
        });
      }

      // Here you would call the API
      console.log('Reaction:', { postId, reactionType, hasReacted });
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert optimistic update on error
      const post = posts.find(p => p.id === postId);
      if (post) {
        updatePost(postId, {
          reactionCount: hasReacted
            ? Math.max(0, post.reactionCount - 1)
            : post.reactionCount + 1,
          userReacted: !hasReacted,
        });
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      removePost(postId);
      // Here you would call the API
      console.log('Delete post:', postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar la publicación');
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Loading skeleton for composer */}
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Loading skeletons for posts */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            variants={animations.skeletonAnimation}
            className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Post Composer */}
      <AnimatePresence>
        {showComposer ? (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={animations.fadeIn}
          >
            <PostComposer
              currentUser={{
                uid: currentUserId,
                displayName: currentUserName,
                photoURL: currentUserPhotoURL,
              }}
              onSubmit={handleCreatePost}
              placeholder="¿Qué novedades quieres compartir con tu equipo?"
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setShowComposer(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg gap-3"
            >
              ✏️ Crear nueva publicación
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Posts Feed */}
      <motion.div
        variants={animations.staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div key={post.id} variants={animations.staggerItem} layout>
              <PostCard
                post={post}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onDelete={handleDeletePost}
                onReaction={handleReaction}
                variant={index === 0 ? 'featured' : 'default'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {!isLoading && posts.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No hay publicaciones aún
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Sé el primero en compartir novedades con tu equipo
          </p>
          <Button
            onClick={() => setShowComposer(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Crear primera publicación
          </Button>
        </motion.div>
      )}

      {/* Load More */}
      {posts.length > 0 && (
        <LoadMoreButton
          onLoadMore={loadMore}
          isLoading={isLoadingMore}
          hasMore={hasMore}
          onRetry={refresh}
        />
      )}
    </div>
  );
}
