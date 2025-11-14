'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PostFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  submitLabel?: string;
  placeholder?: string;
}

export function PostForm({
  onSubmit,
  onCancel,
  initialContent = '',
  submitLabel = 'Publicar',
  placeholder = '¿Qué quieres compartir?',
}: PostFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxLength = 5000;
  const minLength = 1;
  const remainingChars = maxLength - content.length;
  const isValid =
    content.trim().length >= minLength && content.length <= maxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      setError('El contenido debe tener entre 1 y 5000 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      console.error('Error submitting post:', err);
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            disabled={isSubmitting}
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {remainingChars < 100 && (
                <span className={remainingChars < 0 ? 'text-destructive' : ''}>
                  {remainingChars} caracteres restantes
                </span>
              )}
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
