# Script para Resetear la App y Ver el Onboarding

## Para resetear y probar desde cero:

### Opción 1: Desde la Consola del Navegador (F12)
```javascript
// Ejecuta estos comandos en la consola:
import AsyncStorage from '@react-native-async-storage/async-storage';

// Limpiar todo
await AsyncStorage.clear();

// O limpiar solo lo necesario:
await AsyncStorage.removeItem('onboarding_completed');
await AsyncStorage.removeItem('session_token');

// Luego recarga la página
location.reload();
```

### Opción 2: Borrar Datos del Navegador
1. Abre DevTools (F12)
2. Application → Storage → Clear site data
3. Recarga la página

### Opción 3: Modo Incógnito
- Abre la app en una ventana de incógnito
- Verás el onboarding completo

## Para Testing Rápido (sin onboarding):

Si quieres saltarte el onboarding y probar directamente:

1. Ve a: `http://localhost:3000/dev-login`
2. Toca "Create Test User & Login"
3. Espera 2-3 segundos
4. Deberías estar en la app con Plan Pro

## Verificar si el Usuario se Creó:

```bash
# Desde la terminal del servidor:
mongosh test_database --eval "db.users.find().pretty()"
mongosh test_database --eval "db.user_sessions.find().pretty()"
```

## Si el botón no responde:

1. Abre la consola del navegador (F12)
2. Mira si hay errores en rojo
3. Verifica que veas estos logs:
   - "Creating test user..."
   - "Response: {...}"
   - "User created and saved, redirecting..."

## URL Directa para Dev Login:
`http://localhost:3000/dev-login`
