# TODO - Pruebas Auth (Pymex/backend)

- [x] Paso 1: Revisar `authController.test.js` existente y corregir mocks/paths para que testee el controller real y rutas reales.

- [x] Paso 2: Alinear endpoints (por ejemplo `/perfil` vs `/profile`, `/auth/login-admin` vs `/auth/admin/login`, etc.) con `src/domains/auth/routes/auth.js`.

- [ ] Paso 3: Implementar pruebas para AuthController: register, login, loginAdmin, perfil, refreshToken, startTrial, bootstrapSuperAdmin.
- [ ] Paso 4: Ajustar/crear mocks de `authService` y modelos para que reflejen el comportamiento real (sin mockear el controlador completo).
- [ ] Paso 5: Ejecutar `npm test` (o comando de Jest) para validar que pasan los tests de auth.
- [ ] Paso 6: Reforzar `authService.test.js`: `authenticateAdmin` y flujos de refresh (refresh_admin vs refresh) si faltan casos.
- [ ] Paso 7: Reforzar `UsuarioRepository.test.js`: cubrir update/delete cuando no existe, findAll con include/paginación, count.
- [ ] Paso 8: Revisar `authRoutes.test.js` y asegurar validaciones/flujo completo registro->login->refresh->perfil.
- [ ] Paso 9: (Si existe) revisar `e2e/api.e2e.test.js` para agregar un flujo completo end-to-end si falta cobertura.

