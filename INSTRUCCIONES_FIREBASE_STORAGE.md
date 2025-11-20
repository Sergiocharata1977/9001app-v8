# Configuración de Firebase Storage

## Problema Actual

Error al subir archivos: `Firebase Storage: An unknown error occurred (storage/unknown)`

## Causa

Las reglas de seguridad de Firebase Storage están bloqueando las subidas de archivos.

## Solución

### 1. Ir a Firebase Console

1. Abre https://console.firebase.google.com/
2. Selecciona tu proyecto: **app-4b05c**
3. En el menú lateral, ve a **Storage**
4. Haz clic en la pestaña **Rules** (Reglas)

### 2. Actualizar las Reglas de Storage

Reemplaza las reglas actuales con estas:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura y escritura para usuarios autenticados
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024  // Máximo 10MB
                   && request.resource.contentType.matches('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.*|image/.*');
    }

    // Reglas específicas para documentos
    match /documents/{documentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.*|image/.*');
      allow delete: if request.auth != null;
    }
  }
}
```

### 3. Publicar las Reglas

1. Haz clic en **Publish** (Publicar)
2. Confirma los cambios

### 4. Verificar

Después de publicar las reglas:

1. Recarga la aplicación
2. Intenta subir un documento nuevamente
3. Debería funcionar correctamente

## Reglas Explicadas

- **`request.auth != null`**: Solo usuarios autenticados pueden subir/descargar
- **`request.resource.size < 10 * 1024 * 1024`**: Límite de 10MB por archivo
- **`contentType.matches(...)`**: Solo permite PDF, Word, Excel e imágenes
- **`/documents/{documentId}/{fileName}`**: Organiza archivos por documento

## Alternativa: Reglas Más Permisivas (Solo para Desarrollo)

Si necesitas algo más simple para desarrollo:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **IMPORTANTE**: Estas reglas permisivas solo deben usarse en desarrollo. En producción, usa las reglas más restrictivas.

## Verificar Storage Bucket

También verifica que el Storage Bucket esté correctamente configurado:

1. En Firebase Console > Storage
2. Verifica que el bucket sea: `app-4b05c.firebasestorage.app`
3. Si no existe, haz clic en "Get Started" para inicializar Storage

## Problemas Comunes

### Error: "storage/unknown"

- **Causa**: Reglas de seguridad bloqueando
- **Solución**: Actualizar reglas como se indica arriba

### Error: "storage/unauthorized"

- **Causa**: Usuario no autenticado
- **Solución**: Verificar que el usuario esté logueado

### Error: "storage/quota-exceeded"

- **Causa**: Límite de almacenamiento excedido
- **Solución**: Revisar plan de Firebase o limpiar archivos antiguos

### Error: "storage/retry-limit-exceeded"

- **Causa**: Problemas de red
- **Solución**: Verificar conexión a internet
