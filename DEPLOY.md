# 🚀 Guía de Deployment - ParkingApp SaaS

Esta guía te ayudará a desplegar tu aplicación de manera **100% GRATUITA**.

---

## ⭐ MÉTODO RECOMENDADO: Vercel + Neon

### ✅ Ventajas
- ✅ Completamente gratis (sin tarjeta de crédito)
- ✅ Deploy automático desde GitHub
- ✅ HTTPS incluido
- ✅ CDN global
- ✅ Perfect para Next.js
- ✅ No se duerme (siempre activo)

---

## 📋 PASO 1: Crear Base de Datos en Neon

### 1.1 Registrarte en Neon
1. Ve a [https://neon.tech](https://neon.tech)
2. Click en "Sign Up"
3. Usa tu cuenta de GitHub para registrarte
4. Es **100% gratis**, no pide tarjeta

### 1.2 Crear Proyecto
1. Click en "Create a Project"
2. Nombre: `ParkingApp`
3. Región: Elige la más cercana a ti
4. Click "Create Project"

### 1.3 Copiar Connection String
1. Ve a "Dashboard" de tu proyecto
2. Copia la **Connection String** que se ve así:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
3. **Guárdala**, la necesitarás después

---

## 📋 PASO 2: Preparar Código para Deploy

### 2.1 Generar Secret para NextAuth
Ejecuta en tu terminal:

```bash
openssl rand -base64 32
```

Guarda el resultado, será tu `NEXTAUTH_SECRET`.

### 2.2 Push a GitHub (si no lo has hecho)

```bash
# Si no has pusheado el código
git add .
git commit -m "feat: preparar para deploy"
git push
```

---

## 📋 PASO 3: Deploy en Vercel

### 3.1 Crear Cuenta en Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Usa tu cuenta de GitHub
4. Es **100% gratis**

### 3.2 Importar Proyecto
1. Click "Add New..." > "Project"
2. Selecciona tu repositorio `ParkingApp`
3. Click "Import"

### 3.3 Configurar Variables de Entorno
En la pantalla de configuración, agrega estas **Environment Variables**:

**Variable 1:**
- **Name:** `DATABASE_URL`
- **Value:** Tu connection string de Neon (paso 1.3)

**Variable 2:**
- **Name:** `NEXTAUTH_SECRET`
- **Value:** El secret generado (paso 2.1)

**Variable 3:**
- **Name:** `NEXTAUTH_URL`
- **Value:** `https://tu-proyecto.vercel.app` (Vercel te dará esta URL)

**IMPORTANTE:** Por ahora puedes usar una URL temporal como `https://parking-app.vercel.app`, la actualizarás después.

### 3.4 Deploy
1. Click "Deploy"
2. Espera 2-3 minutos
3. ✅ ¡Tu app estará desplegada!

---

## 📋 PASO 4: Configurar Base de Datos

### 4.1 Ejecutar Migraciones

Después del deploy, necesitas crear las tablas en la base de datos:

**Opción A: Desde tu computadora**
```bash
# Configura la variable de entorno
export DATABASE_URL="tu-connection-string-de-neon"

# Ejecuta Prisma
npx prisma db push
```

**Opción B: Desde Vercel CLI**
```bash
# Instala Vercel CLI
npm i -g vercel

# Login
vercel login

# Link tu proyecto
vercel link

# Ejecuta comando en Vercel
vercel env pull .env.local
npx prisma db push
```

---

## 📋 PASO 5: Actualizar NEXTAUTH_URL

1. Ve a Vercel Dashboard de tu proyecto
2. Ve a "Settings" > "Environment Variables"
3. Edita `NEXTAUTH_URL`
4. Cambia a la URL real de tu deploy (ej: `https://parking-app-abc123.vercel.app`)
5. Click "Save"
6. **Redeploy** tu proyecto (Settings > Deployments > Tres puntos > Redeploy)

---

## ✅ PASO 6: Verificar Deploy

### 6.1 Visita tu App
Abre la URL de Vercel en tu navegador:
```
https://tu-proyecto.vercel.app
```

### 6.2 Crear Primer Usuario
1. Ve a `/auth/signin`
2. No tienes cuenta, ve a Sign Up
3. Crea tu primer usuario (será SUPER_ADMIN por defecto)

### 6.3 Verificar Funcionalidad
- ✅ Login funciona
- ✅ Dashboard carga
- ✅ Puedes crear datos

---

## 🎉 ¡LISTO! Tu app está en producción

**URL de tu aplicación:** `https://tu-proyecto.vercel.app`

---

## 🔧 COMANDOS ÚTILES

### Ver logs en tiempo real
```bash
vercel logs
```

### Redeploy manual
```bash
vercel --prod
```

### Ver variables de entorno
```bash
vercel env ls
```

---

## 🆓 ALTERNATIVAS GRATUITAS

Si prefieres otra opción, aquí tienes otras plataformas gratuitas:

### **OPCIÓN 2: Render**
- **Pros:** Todo en uno (app + DB), PostgreSQL gratis
- **Contras:** Se duerme después de 15 min sin uso
- **URL:** https://render.com

### **OPCIÓN 3: Railway**
- **Pros:** $5 crédito gratis/mes, muy fácil
- **Contras:** Limitado a $5/mes
- **URL:** https://railway.app

### **OPCIÓN 4: Fly.io**
- **Pros:** 3 VMs gratis, 3 GB PostgreSQL
- **Contras:** Más complejo de configurar
- **URL:** https://fly.io

---

## 📱 DESPUÉS DEL DEPLOY

### Configurar Dominio Custom (Opcional)
1. Compra un dominio en Namecheap, Google Domains, etc.
2. En Vercel: Settings > Domains > Add
3. Sigue las instrucciones para configurar DNS

### Habilitar HTTPS (Automático)
- Vercel configura HTTPS automáticamente
- Certificados SSL renovados automáticamente

### Monitoreo
- Ve analytics en Vercel Dashboard
- Configura alertas de errores (opcional: Sentry)

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot connect to database"
- ✅ Verifica que `DATABASE_URL` esté correctamente configurada
- ✅ Verifica que Neon DB esté activa
- ✅ Ejecuta `npx prisma db push` nuevamente

### Error: "NEXTAUTH_SECRET is not defined"
- ✅ Verifica variables de entorno en Vercel
- ✅ Redeploy después de agregar variables

### Build falla
- ✅ Verifica que `prisma generate` se ejecute
- ✅ Mira logs en Vercel para ver el error exacto

### Página 404
- ✅ Verifica que la ruta exista
- ✅ Revisa middleware.ts para protección de rutas

---

## 📞 SOPORTE

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## 🎊 ¡FELICITACIONES!

Tu aplicación de parking SaaS está desplegada y funcionando en producción de forma **100% GRATUITA**.

**Siguiente paso:** Comparte la URL con tus usuarios y empieza a gestionar estacionamientos!
