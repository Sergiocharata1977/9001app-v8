#!/bin/bash

# Script de Despliegue Automatizado - Sistema ISO 9001 V8
# Hostinger VPS

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue del Sistema ISO 9001 V8..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos como root o con sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root o con sudo"
    exit 1
fi

# Paso 1: Actualizar sistema
print_status "Actualizando sistema..."
apt update && apt upgrade -y

# Paso 2: Eliminar proyectos anteriores
print_status "Eliminando proyectos anteriores..."
cd /var/www/html 2>/dev/null || cd /home/*/public_html 2>/dev/null || {
    print_error "No se pudo encontrar el directorio web"
    exit 1
}

# Eliminar proyectos anteriores
rm -rf 9001app-v6 9001app-v7 iso9001-v6 iso9001-v7 2>/dev/null || true
print_status "Proyectos anteriores eliminados"

# Paso 3: Instalar Node.js 18+
print_status "Instalando Node.js 18+..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar instalación
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js instalado: $NODE_VERSION"
print_status "NPM instalado: $NPM_VERSION"

# Paso 4: Instalar PM2
print_status "Instalando PM2..."
npm install -g pm2

PM2_VERSION=$(pm2 --version)
print_status "PM2 instalado: $PM2_VERSION"

# Paso 5: Clonar repositorio
print_status "Clonando repositorio V8..."
git clone https://github.com/Sergiocharata1977/9001app-v8.git
cd 9001app-v8

# Paso 6: Instalar dependencias
print_status "Instalando dependencias..."
npm install

# Paso 7: Crear archivo de variables de entorno
print_status "Creando archivo de variables de entorno..."
cat > .env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
EOF

print_warning "IMPORTANTE: Edita el archivo .env.local con tus credenciales de Firebase"

# Paso 8: Build de producción
print_status "Ejecutando build de producción..."
npm run build

# Paso 9: Crear directorio de logs
print_status "Creando directorio de logs..."
mkdir -p logs

# Paso 10: Configurar PM2
print_status "Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'iso9001-v8',
    script: 'npm',
    args: 'start',
    cwd: '$(pwd)',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Paso 11: Iniciar con PM2
print_status "Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Paso 12: Instalar Nginx
print_status "Instalando Nginx..."
apt install nginx -y

# Paso 13: Configurar Nginx
print_status "Configurando Nginx..."
cat > /etc/nginx/sites-available/iso9001-v8 << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Paso 14: Activar sitio
print_status "Activando sitio en Nginx..."
ln -sf /etc/nginx/sites-available/iso9001-v8 /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
systemctl enable nginx

# Paso 15: Verificar estado
print_status "Verificando estado de servicios..."
sleep 5

# Verificar PM2
pm2 status

# Verificar Nginx
systemctl status nginx --no-pager

# Verificar que la aplicación responde
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Aplicación respondiendo en puerto 3000"
else
    print_warning "⚠️  Aplicación no responde en puerto 3000"
fi

# Mostrar información final
echo ""
echo "🎉 Despliegue completado!"
echo ""
echo "📋 Información del despliegue:"
echo "   - Aplicación: http://localhost:3000"
echo "   - PM2 Status: pm2 status"
echo "   - Logs: pm2 logs iso9001-v8"
echo "   - Reiniciar: pm2 restart iso9001-v8"
echo ""
echo "🔧 Próximos pasos:"
echo "   1. Editar .env.local con credenciales de Firebase"
echo "   2. Reiniciar aplicación: pm2 restart iso9001-v8"
echo "   3. Configurar dominio en Nginx"
echo "   4. Configurar SSL con Certbot (opcional)"
echo ""
echo "📞 Soporte:"
echo "   - Logs PM2: pm2 logs iso9001-v8"
echo "   - Logs Nginx: tail -f /var/log/nginx/error.log"
echo "   - Estado servicios: systemctl status nginx"
