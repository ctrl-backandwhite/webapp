# Implementación de Logout Correcto - Angular + OAuth2/Spring Security

## Resumen de Cambios

Se ha implementado un flujo de logout correcto que sincroniza el estado del frontend con el backend OAuth2.

### 1. **AuthService** (`src/app/core/auth/services/auth.service.ts`)
   - ✅ Agregado método `logout()` asíncrono que:
     - Realiza una llamada HTTP POST al endpoint `/logout` del backend
     - Limpia tokens y estado local (independientemente del resultado del servidor)
     - Maneja errores gracefully con fallback
   
   ```typescript
   async logout(): Promise<void> {
       try {
           await firstValueFrom(
               this.http.post(this.logoutEndpoint, {}).pipe(
                   catchError(() => of(null))
               )
           );
       } catch (error) {
           console.error('[Auth] Logout HTTP request failed:', error);
       } finally {
           // Siempre limpiar estado local
           this.tokenService.clearTokens();
           this.pkceService.clearVerifier();
           this.authStateService.setUnauthenticated();
           localStorage.removeItem('authInitiated');
       }
   }
   ```

### 2. **Navbar Component** (`src/app/core/layout/navbar/navbar.component.ts`)
   - ✅ Actualizado `onLogout()` para esperar a que se complete la promesa
   - Ahora navega a login solo después de que se complete el logout
   
   ```typescript
   onLogout(): void {
       this.authService.logout().then(() => {
           this.router.navigate(['/']);
       });
   }
   ```

### 3. **Auth Interceptor** (`src/app/core/auth/interceptors/auth.interceptor.ts`)
   - ✅ Mejorado para manejar errores 401 (Unauthorized)
   - Detecta cuando la sesión ha expirado en el servidor
   - Ejecuta logout automático y redirige al login
   - Evita múltiples logout simultáneos con flag `isLoggingOut`

## Flujo de Logout

### Logout Manual (Usuario hace clic en "Cerrar sesión")
```
1. Usuario hace clic en botón logout
   ↓
2. NavbarComponent.onLogout() → AuthService.logout()
   ↓
3. AuthService:
   a) POST /logout (notificar al servidor)
   b) Limpiar localStorage (tokens)
   c) Actualizar AuthState a unauthenticated
   ↓
4. NavbarComponent navega a /login (dentro del .then())
```

### Logout Automático (Sesión expirada)
```
1. Usuario hace request HTTP con token expirado
   ↓
2. Servidor responde 401 Unauthorized
   ↓
3. AuthInterceptor detecta error 401
   ↓
4. AuthInterceptor ejecuta:
   a) AuthService.logout()
   b) router.navigate(['/login'])
```

## Configuración del Backend (Validar)

Tu implementación en Spring Security incluye:

```java
.logout(logout -> logout
    .logoutUrl("/logout")
    .invalidateHttpSession(true)
    .clearAuthentication(true)
    .deleteCookies("JSESSIONID")
    .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
```

✅ **Esto es correcto**. El backend:
- Invalida la sesión HTTP
- Limpia la autenticación
- Elimina cookies de sesión
- Retorna 204 No Content

## Recomendaciones Adicionales

### 1. **Revoke Tokens (Seguridad Extra)**
Considera agregar un endpoint en el backend para revocar tokens:

```java
@PostMapping("/revoke")
public ResponseEntity<?> revokeToken(@RequestParam String token) {
    // Agregar token a blacklist/cache
    // O invalidad el token en la base de datos
    return ResponseEntity.noContent().build();
}
```

Y en el frontend, antes de desloguear:
```typescript
async logout(): Promise<void> {
    try {
        const token = this.tokenService.getAccessToken();
        if (token) {
            await firstValueFrom(
                this.http.post(`${this.baseUrl}/revoke`, { token })
            );
        }
    } catch (error) {
        console.warn('Token revoke failed, continuing logout');
    }
    // ... resto del logout
}
```

### 2. **Estado Global con Signal**
Agregar un signal que emita cuando ocurre logout para coordinar múltiples componentes:

```typescript
export class AuthStateService {
    private loggedOutSubject = signal<void>(undefined);
    readonly loggedOut$ = this.loggedOutSubject.asReadonly();
    
    notifyLogout(): void {
        this.loggedOutSubject.set(undefined);
    }
}
```

### 3. **Verificación de CORS en el Backend**
Tu Caddyfile requiere cookies (`setAllowCredentials(true)`), pero verifica que estés enviándolas:

```typescript
// En environment.ts o app config
provideHttpClient(
    withInterceptors([authInterceptor]),
    // Para incluir cookies en requests cross-origin
)
```

### 4. **Manejo de Errores en Navbar**
Considera mostrar feedback al usuario:

```typescript
onLogout(): void {
    this.authService.logout()
        .then(() => {
            // Opcional: Toast de éxito
            this.router.navigate(['/']);
        })
        .catch((error) => {
            console.error('Logout failed:', error);
            // Mostrar error al usuario
        });
}
```

### 5. **Token Refresh Automático**
Si tienes un `refreshToken`, considera agregar lógica para refrescar automáticamente antes de que expire:

```typescript
private startTokenRefreshTimer(): void {
    const expiresAt = this.tokenService.getExpiresAt();
    if (!expiresAt) return;
    
    const expiresIn = expiresAt - Date.now();
    const refreshAt = expiresIn * 0.8; // Refrescar al 80% de duración
    
    setTimeout(() => {
        this.refreshToken();
    }, refreshAt);
}
```

## Testing

Prueba estos escenarios:

1. **Logout Manual**
   - [ ] Clic en logout → Redirige a login
   - [ ] localStorage limpio
   - [ ] Estado auth es unauthenticated

2. **Logout por Expiración**
   - [ ] Modificar token expirado en localStorage
   - [ ] Hacer request HTTP
   - [ ] Debe redirigir automáticamente a login

3. **Error en Backend**
   - [ ] Simular error en /logout
   - [ ] Verificar que se limpia estado local igual
   - [ ] Usuario redirigido a login

## Archivos Modificados

- ✅ `src/app/core/auth/services/auth.service.ts`
- ✅ `src/app/core/auth/interceptors/auth.interceptor.ts`
- ✅ `src/app/core/layout/navbar/navbar.component.ts`

## Archivos Creados

- ✅ `src/app/core/auth/interceptors/logout.interceptor.ts` (Opcional, ya está en auth.interceptor)

---

**Nota**: El file `logout.interceptor.ts` creado es redundante ya que la lógica está en `auth.interceptor.ts`. Puede eliminarse si lo deseas.
