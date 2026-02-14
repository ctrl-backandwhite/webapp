# Cypress E2E (Core)

## Requisitos
- App corriendo en http://localhost:4200
- Token valido para pruebas (API real)

## Variables de entorno
- CYPRESS_accessToken (obligatorio)
- CYPRESS_refreshToken (opcional)
- CYPRESS_expiresIn (opcional, segundos)

## Ejecutar
- npm run cypress:open
- npm run cypress:run
- npx cypress cache clear
- npm run cypress:run -- --browser chrome

Ejemplo:
```bash
CYPRESS_accessToken="TU_TOKEN" npm run cypress:open
```

## Arquitectura
- cypress/e2e: specs por dominio
- cypress/pages: page objects para UI
- cypress/support: comandos y setup global

## Convenciones
- Un spec por flujo de negocio
- Reutilizar page objects para acciones repetidas
- Mantener datos de prueba unicos por ejecucion
