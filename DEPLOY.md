# Guía de Despliegue - Sistema ISO 9001

## 🚀 Opciones de Despliegue

### 1. Vercel (Más Fácil) ⭐

**Ventajas:**
- Deploy automático desde GitHub
- CDN global
- SSL automático
- Escalado automático
- Gratis para proyectos pequeños

**Pasos:**

1. **Subir a GitHub**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/Sergiocharata1977/9001app-v8.git
git push -u origin main
```

2. **Conectar con Vercel**
   - Ir a [vercel.com](https://vercel.com)
   - Importar proyecto desde GitHub
   - Configurar variables de entorno Firebase
   - Deploy automático

3. **Variables de entorno en Vercel**
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 2. Hostinger VPS (Más Control) 🖥️

**Ventajas:**
- Control total del servidor
- Costo fijo mensual
- Puedes instalar otras aplicaciones
- Base de datos propia (opcional)

**Pasos:**

#### Preparación del Servidor

1. **Acceder al VPS**
```bash
ssh root@tu-ip-del-vps
```

2. **Actualizar sistema**
```bash
apt update && apt upgrade -y
```

3. **Instalar Node.js 18+**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

4. **Instalar PM2**
```bash
npm install -g pm2
```

5. **Instalar Nginx (opcional)**
```bash
apt install nginx -y
systemctl enable nginx
systemctl start nginx
```

#### Despliegue de la Aplicación

1. **Clonar repositorio**
```bash
cd /var/www
git clone https://github.com/Sergiocharata1977/9001app-v8.git
cd 9001app-v8
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
nano .env.local
```

Agregar:
```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

4. **Build de producción**
```bash
npm run build
```

5. **Configurar PM2**
```bash
# El archivo ecosystem.config.js ya está creado
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Configurar Nginx (opcional)**
```bash
nano /etc/nginx/sites-available/iso9001
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar sitio:
```bash
ln -s /etc/nginx/sites-available/iso9001 /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### SSL con Let's Encrypt (opcional)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 3. Netlify (Alternativa)

**Ventajas:**
- Deploy desde GitHub
- CDN global
- SSL automático
- Formularios sin backend

**Pasos:**

1. **Subir a GitHub** (igual que Vercel)
2. **Conectar con Netlify**
   - Ir a [netlify.com](https://netlify.com)
   - Importar desde GitHub
   - Configurar build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
3. **Variables de entorno**
   - Site settings > Environment variables
   - Agregar variables Firebase

## 🔧 Comandos Útiles para Producción

### PM2 (Hostinger)

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs iso9001-app

# Reiniciar
pm2 restart iso9001-app

# Parar
pm2 stop iso9001-app

# Eliminar
pm2 delete iso9001-app

# Monitoreo
pm2 monit
```

### Actualizaciones

```bash
# En el servidor
cd /var/www/9001app-v8
git pull origin main
npm install
npm run build
pm2 restart iso9001-app
```

### Backup

```bash
# Backup de la aplicación
tar -czf iso9001-backup-$(date +%Y%m%d).tar.gz /var/www/9001app-v8

# Backup de logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz ./logs/
```

## 📊 Monitoreo

### Métricas importantes

- **CPU**: `< 80%`
- **RAM**: `< 80%`
- **Disk**: `< 90%`
- **Uptime**: `> 99%`

### Herramientas recomendadas

- **PM2 Plus**: Monitoreo avanzado
- **Uptime Robot**: Monitoreo externo
- **Google Analytics**: Métricas de uso

## 🚨 Troubleshooting

### Error: Port 3000 already in use
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso
kill -9 PID
```

### Error: Cannot find module
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: Build failed
```bash
# Limpiar cache
npm run build -- --no-cache

# Verificar variables de entorno
echo $NODE_ENV
```

## 📈 Optimizaciones

### Performance

1. **Compresión Gzip**
```nginx
# En nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Cache de assets**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Optimización de imágenes**
```bash
npm install -g imagemin-cli
```

### Seguridad

1. **Firewall**
```bash
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443
```

2. **Actualizaciones**
```bash
# Automatizar con cron
0 2 * * * apt update && apt upgrade -y
```

## 📞 Soporte

- **GitHub Issues**: [Crear issue](https://github.com/Sergiocharata1977/9001app-v8/issues)
- **Email**: soporte@iso9001-app.com
- **Documentación**: [Wiki del proyecto](https://github.com/Sergiocharata1977/9001app-v8/wiki)

---

**¡Despliegue exitoso! 🎉**
