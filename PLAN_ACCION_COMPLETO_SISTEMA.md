# Plan de Acción Completo - Sistema 9001app

**Fecha:** 18 de Noviembre, 2025  
**Versión:** 2.0  
**Estado:** Actualizado con análisis completo

---

## 📊 Resumen Ejecutivo

El sistema tiene **3 módulos principales en desarrollo** con diferentes estados de madurez:

| Módulo                | Estado          | Prioridad | Tareas Pendientes              |
| --------------------- | --------------- | --------- | ------------------------------ |
| 📰 **Noticias**       | ✅ MVP Completo | MEDIA     | Página detalle + Fixes menores |
| 🗣️ **Don Cándido IA** | ⚠️ Bloqueado    | CRÍTICA   | Arreglar voz + 11 tareas más   |
| 📅 **Calendario**     | ✅ Funcional    | BAJA      | Mejoras opcionales             |

---

## 🚨 PRIORIDAD 1: ARREGLAR DON CÁNDIDO IA (BLOQUEANTE)

### Problema Crítico

**LA VOZ NO FUNCIONA** - El usuario debe escribir en lugar de hablar

### Causa Raíz

- VoiceRecorder usa Web Speech API del navegador (no confiable)
- No hay grabación de audio real
- No hay integración con Whisper API

### Solución Inmediata (Esta Semana)

#### Paso 1: Implementar Grabación de Audio Real (4 horas)

**Archivo:** `src/components/ia/VoiceRecorder.tsx`

```typescript
'use client';

import { Mic, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscript, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);

        // Detener stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      onTranscript(data.text);
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Error al transcribir audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled || isTranscribing}
      variant={isRecording ? 'destructive' : 'default'}
      size="icon"
    >
      {isTranscribing ? (
        <span className="animate-spin">⏳</span>
      ) : isRecording ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
```

#### Paso 2: Crear Endpoint de Whisper (3 horas)

**Archivo:** `src/app/api/whisper/transcribe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    await auth.verifyIdToken(token);

    // Obtener archivo de audio
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Convertir a buffer
    const buffer = await audioFile.arrayBuffer();

    // Enviar a OpenAI Whisper
    const whisperFormData = new FormData();
    whisperFormData.append(
      'file',
      new Blob([buffer], { type: 'audio/webm' }),
      'audio.webm'
    );
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'es');

    const whisperResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: whisperFormData,
      }
    );

    if (!whisperResponse.ok) {
      throw new Error('Whisper API error');
    }

    const result = await whisperResponse.json();

    return NextResponse.json({
      success: true,
      text: result.text,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
```

#### Paso 3: Configurar Variables de Entorno

**Archivo:** `.env.local`

```env
# OpenAI Whisper
OPENAI_API_KEY=sk-proj-...

# ElevenLabs Voice
ELEVENLABS_VOICE_ID=kulszILr6ees0ArU8miO
ELEVENLABS_VOICE_STABILITY=0.5
ELEVENLABS_VOICE_SIMILARITY=0.75
```

#### Paso 4: Probar End-to-End (1 hora)

- [ ] Grabar audio desde el navegador
- [ ] Enviar a Whisper API
- [ ] Recibir transcripción
- [ ] Mostrar en chat

**Total Paso 1: ~12 horas**

---

## 🎯 PRIORIDAD 2: COMPLETAR MÓDULO DE NOTICIAS

### Estado Actual

- ✅ MVP completo (posts, comentarios, reacciones)
- ✅ Imágenes implementadas
- ❌ Falta página de detalle de post
- ❌ Falta sidebar con trending

### Tareas Pendientes

#### Tarea 1: Crear Página de Detalle (2 horas)

**Archivo:** `src/app/(dashboard)/noticias/[id]/page.tsx`

```typescript
'use client';

import { CommentList } from '@/components/news/CommentList';
import { PostCard } from '@/components/news/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (!firebaseUser) {
            router.push('/login');
            return;
          }

          const idTokenResult = await firebaseUser.getIdTokenResult();
          setUser({
            uid: firebaseUser.uid,
            role: idTokenResult.claims.role || 'user',
          });

          // Cargar post
          const token = await firebaseUser.getIdToken();
          const response = await fetch(`/api/news/posts/${params.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setPost(data.data);
          }

          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading post:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!post || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Post no encontrado</p>
        <Link href="/noticias">
          <Button className="mt-4">Volver al feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link href="/noticias">
        <Button variant="ghost" className="mb-4">← Volver</Button>
      </Link>

      <PostCard
        post={post}
        currentUserId={user.uid}
        isAdmin={user.role === 'admin'}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Comentarios</h2>
        <CommentList
          postId={params.id}
          currentUserId={user.uid}
          isAdmin={user.role === 'admin'}
        />
      </div>
    </div>
  );
}
```

#### Tarea 2: Crear Sidebar con Trending (2 horas)

**Archivo:** `src/components/news/NewsSidebar.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Post } from '@/types/news';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function NewsSidebar() {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) return;

        const token = await user.getIdToken();
        const response = await fetch('/api/sdk/posts/trending?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setTrendingPosts(data.data || []);
        }
      } catch (error) {
        console.error('Error loading trending:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrending();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : trendingPosts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay posts trending</p>
        ) : (
          <div className="space-y-3">
            {trendingPosts.map((post) => (
              <Link key={post.id} href={`/noticias/${post.id}`}>
                <div className="p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                  <p className="text-sm font-medium line-clamp-2">{post.content}</p>
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <span>💬 {post.commentCount}</span>
                    <span>❤️ {post.reactionCount}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Tarea 3: Integrar Sidebar en Página Principal (1 hora)

**Archivo:** `src/app/(dashboard)/noticias/page.tsx`

```typescript
'use client';

import { NewsFeed } from '@/components/news/NewsFeed';
import { NewsSidebar } from '@/components/news/NewsSidebar';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NoticiasPage() {
  const [user, setUser] = useState<{ uid: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();

        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
          if (!firebaseUser) {
            router.push('/login');
            return;
          }

          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = (idTokenResult.claims.role as string) || 'user';

          setUser({
            uid: firebaseUser.uid,
            role,
          });
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Noticias</h1>
        <p className="text-muted-foreground mt-1">
          Mantente al día con las novedades de la organización
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NewsFeed
            organizationId="default-org"
            currentUserId={user.uid}
            isAdmin={user.role === 'admin'}
          />
        </div>
        <div>
          <NewsSidebar />
        </div>
      </div>
    </div>
  );
}
```

**Total Noticias: ~5 horas**

---

## 📅 PRIORIDAD 3: OPTIMIZACIONES MENORES

### Calendario

- ✅ Funcional
- Mejoras opcionales: Sincronización con Google Calendar

### Documentos

- ✅ Funcional
- Mejoras opcionales: Búsqueda avanzada

### Auditorías

- ✅ Funcional
- Mejoras opcionales: Reportes automáticos

---

## 📋 CRONOGRAMA RECOMENDADO

### Semana 1 (CRÍTICA)

- **Lunes-Miércoles:** Arreglar voz en Don Cándido (12h)
- **Jueves-Viernes:** Completar Noticias (5h)
- **Total:** 17 horas

### Semana 2-6

- Implementar mejoras de Don Cándido (formularios, acciones, análisis)
- Optimizaciones de performance
- Testing y QA

---

## 🔧 CHECKLIST DE IMPLEMENTACIÓN

### Semana 1

- [ ] **Lunes**
  - [ ] Crear VoiceRecorder con MediaRecorder API
  - [ ] Crear endpoint de Whisper
  - [ ] Configurar variables de entorno

- [ ] **Martes**
  - [ ] Probar grabación de audio
  - [ ] Probar transcripción
  - [ ] Integrar en DonCandidoChat

- [ ] **Miércoles**
  - [ ] Crear página de detalle de post
  - [ ] Crear sidebar con trending
  - [ ] Integrar en página principal

- [ ] **Jueves**
  - [ ] Testing completo
  - [ ] Fixes de bugs
  - [ ] Documentación

- [ ] **Viernes**
  - [ ] Deploy a staging
  - [ ] Testing final
  - [ ] Deploy a producción

---

## 📊 Métricas de Éxito

### Don Cándido

- ✅ Usuario puede grabar voz
- ✅ Transcripción funciona correctamente
- ✅ Respuestas de audio se reproducen
- ✅ Modo conversación continuo funciona

### Noticias

- ✅ Página de detalle funciona
- ✅ Sidebar muestra trending
- ✅ Todas las funcionalidades del MVP funcionan
- ✅ Performance aceptable

---

## 📞 Recursos

### Documentos Técnicos

- `TAREAS_PENDIENTES_IA_DON_CANDIDO.md` - Tareas detalladas de IA
- `RESUMEN_EJECUTIVO_IA_DON_CANDIDO.md` - Resumen ejecutivo
- `.kiro/specs/noticias-organizacionales/` - Specs de noticias
- `.kiro/specs/sdk-unificado-modulos/` - Specs del SDK

### APIs Necesarias

- OpenAI Whisper: https://platform.openai.com/docs/guides/speech-to-text
- ElevenLabs: https://elevenlabs.io/docs/api-reference/text-to-speech
- Anthropic Claude: https://docs.anthropic.com/claude/reference/

---

**Última actualización:** 18 de Noviembre, 2025  
**Próxima revisión:** Después de completar Semana 1
