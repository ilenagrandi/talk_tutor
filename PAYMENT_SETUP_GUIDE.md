# Guía de Configuración de Pagos Reales con RevenueCat

## Estado Actual
La aplicación tiene un sistema de suscripción MOCK para testing. Para habilitar pagos reales, necesitas configurar RevenueCat y las tiendas de aplicaciones.

## Requisitos Previos

### 1. Cuentas Necesarias

**RevenueCat (Gratis para empezar)**
- Sitio: https://www.revenuecat.com/
- Plan gratuito: Hasta $10,000 en ingresos mensuales
- Registrate con tu email

**Apple Developer Program ($99 USD/año)**
- Sitio: https://developer.apple.com/programs/
- Requerido para publicar en App Store
- Necesario para configurar in-app purchases

**Google Play Console ($25 USD pago único)**
- Sitio: https://play.google.com/console/
- Requerido para publicar en Google Play
- Necesario para configurar in-app billing

### 2. Configuración de RevenueCat

#### Paso 1: Crear Proyecto en RevenueCat
1. Ir a https://app.revenuecat.com/
2. Crear nuevo proyecto "TalkTutor"
3. Seleccionar plataformas: iOS y Android

#### Paso 2: Obtener API Keys
1. En RevenueCat Dashboard → Settings → API Keys
2. Copiar:
   - **Public API Key** (para el frontend)
   - **Secret API Key** (para el backend, opcional)

#### Paso 3: Configurar Productos en RevenueCat
En RevenueCat Dashboard → Products:

**Producto 1: Standard Monthly**
- Product ID: `standard_monthly`
- Price: $9.99/month
- Duration: 1 month

**Producto 2: Standard Annual**
- Product ID: `standard_annual`
- Price: $99.99/year
- Duration: 1 year

**Producto 3: Premium Monthly**
- Product ID: `premium_monthly`
- Price: $19.99/month
- Duration: 1 month

**Producto 4: Premium Annual**
- Product ID: `premium_annual`
- Price: $199.99/year
- Duration: 1 year

**Producto 5: Pro Monthly**
- Product ID: `pro_monthly`
- Price: $29.99/month
- Duration: 1 month

**Producto 6: Pro Annual**
- Product ID: `pro_annual`
- Price: $299.99/year
- Duration: 1 year

#### Paso 4: Crear Entitlements
En RevenueCat Dashboard → Entitlements:

**Entitlement 1: "standard"**
- Attached Products: standard_monthly, standard_annual

**Entitlement 2: "premium"**
- Attached Products: premium_monthly, premium_annual

**Entitlement 3: "pro"**
- Attached Products: pro_monthly, pro_annual

### 3. Configuración de Apple App Store

#### Paso 1: Crear App en App Store Connect
1. Ir a https://appstoreconnect.apple.com/
2. My Apps → + → New App
3. Llenar información básica de TalkTutor

#### Paso 2: Configurar In-App Purchases
1. En tu app → Features → In-App Purchases
2. Crear cada producto con **MISMO Product ID** que RevenueCat:

Para cada suscripción:
- Type: Auto-Renewable Subscription
- Reference Name: Standard Monthly (por ejemplo)
- Product ID: `standard_monthly` (debe coincidir exactamente con RevenueCat)
- Subscription Group: "TalkTutor Subscriptions"
- Subscription Duration: 1 month
- Price: $9.99
- Localizations: Agregar descripción en inglés y español

#### Paso 3: Crear Subscription Group
1. Name: "TalkTutor Subscriptions"
2. Agregar todas las suscripciones al mismo grupo
3. Esto permite upgrades/downgrades entre planes

#### Paso 4: Configurar App-Specific Shared Secret
1. App Store Connect → My Apps → TalkTutor → App Information
2. App-Specific Shared Secret → Generate
3. Copiar el secret

#### Paso 5: Conectar con RevenueCat
1. RevenueCat Dashboard → Project Settings → Apple App Store
2. Pegar:
   - Bundle ID de tu app
   - App-Specific Shared Secret
3. Enable "Server-to-Server Notifications"

### 4. Configuración de Google Play Store

#### Paso 1: Crear App en Google Play Console
1. Ir a https://play.google.com/console/
2. Create app
3. Llenar información de TalkTutor

#### Paso 2: Configurar In-App Products
1. Monetize → Products → Subscriptions
2. Create subscription para cada plan:

Para cada suscripción:
- Product ID: `standard_monthly` (debe coincidir con RevenueCat)
- Name: Standard Plan - Monthly
- Description: Unlimited AI conversation analysis
- Billing period: 1 month
- Price: $9.99

#### Paso 3: Crear Service Account
1. Google Cloud Console → Service Accounts
2. Create Service Account
3. Grant Role: "Pub/Sub Admin"
4. Create JSON key

#### Paso 4: Conectar con RevenueCat
1. RevenueCat Dashboard → Project Settings → Google Play Store
2. Upload el JSON key file
3. Pegar Package Name de tu app

### 5. Actualizar el Código

#### Frontend: Instalar SDK
```bash
cd /app/frontend
yarn add react-native-purchases
```

#### Frontend: Configurar en app.json
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-purchases",
        {
          "apiKey": "TU_REVENUECAT_PUBLIC_API_KEY"
        }
      ]
    ]
  }
}
```

#### Frontend: Actualizar subscription.tsx
Reemplazar el código mock con llamadas reales a RevenueCat SDK.

#### Backend: Variables de Entorno
Agregar a `/app/backend/.env`:
```
REVENUECAT_API_KEY=tu_secret_api_key_aqui
```

### 6. Testing

#### Sandbox Testing (iOS)
1. Settings → App Store → Sandbox Account
2. Crear sandbox tester en App Store Connect
3. Usar credenciales de sandbox para comprar

#### Testing (Android)
1. Google Play Console → Setup → License Testing
2. Agregar emails de testers
3. Instalar app vía Internal Testing track

### 7. Webhooks (Opcional pero Recomendado)

#### Configurar en RevenueCat
1. RevenueCat → Integrations → Webhooks
2. URL: `https://tu-dominio.com/api/webhooks/revenuecat`
3. Events: Select all subscription events

#### Crear endpoint en backend
```python
@app.post("/api/webhooks/revenuecat")
async def revenuecat_webhook(request: Request):
    payload = await request.json()
    # Procesar evento de suscripción
    # Actualizar base de datos
    return {"status": "ok"}
```

## Costos Estimados

**Configuración Inicial:**
- RevenueCat: $0 (gratis hasta $10k/mes)
- Apple Developer: $99/año
- Google Play: $25 una vez
- **Total: $124**

**Costos Recurrentes:**
- RevenueCat: Gratis hasta $10,000 MRR, luego 1% de ingresos
- Apple: 30% de comisión (primero año), 15% (año 2+)
- Google: 15% de comisión
- **Total: ~30% de tus ingresos**

## Alternativa: Sistema de Pago Temporal

Si quieres lanzar rápido sin configurar todo esto, puedes:

1. **Usar el sistema MOCK actual** para beta/MVP
2. **Código promocional**: Dar acceso premium manualmente
3. **PayPal/Stripe directo**: Cobrar fuera de las stores (viola políticas de las tiendas, no recomendado)

## ¿Necesitas Ayuda?

Una vez que tengas las cuentas y API keys, puedo:
1. Actualizar el código para usar RevenueCat real
2. Configurar los webhooks
3. Implementar el flujo completo de suscripción

**Información que necesitaré:**
- RevenueCat Public API Key
- Bundle ID (iOS)
- Package Name (Android)

## Siguiente Paso

Dime si:
1. **Ya tienes las cuentas** → Te ayudo a conectar todo
2. **Quieres mantener el MOCK** → Mejoro la UI para indicar claramente que es testing
3. **Quieres otra opción de pago** → Exploramos alternativas
