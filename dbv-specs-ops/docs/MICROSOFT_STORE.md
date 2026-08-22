# 🏬 Publicación en Microsoft Store: DBV Teleprompter

> **Estado:** 📦 Paquete MSIX generado (`v0.2.0`) — listo para subir a Partner Center.
> **Última revisión:** 2026-08-22

---

## 1. Datos de Identidad en Microsoft Partner Center

- **Nombre del producto:** `DBV Teleprompter`
- **Package/Identity/Name:** `davidbuenov.DBVTeleprompter`
- **Package/Identity/Publisher:** `CN=13EE2A5D-F49E-48C9-8873-941069B15D63`
- **Package/Properties/PublisherDisplayName:** `davidbuenov`
- **Package Family Name (PFN):** `davidbuenov.DBVTeleprompter_ze9zfmg3hs4tt`
- **Store ID:** `9PDVSGXHLFN2`

---

## 2. Archivo del Paquete Binario a Subir

En la sección **Paquetes** (*Packages*) del envío en Partner Center, sube el archivo generado:

📁 **Ruta:**
`src-tauri/target/msix/dbv-teleprompter_0.2.0.0.msixbundle` (~2.79 MB)

*(Microsoft Store firma automáticamente el paquete tras la certificación con su propio certificado de confianza pública).*

---

## 3. Fichas de Texto y Galería de Capturas

- **Ficha en Español:** [descripcionStore_es.md](file:///d:/Programacion/github-davidbuenov/dbv-teleprompter/descripcionStore_es.md)
- **Ficha en Inglés:** [descripcionStore_en.md](file:///d:/Programacion/github-davidbuenov/dbv-teleprompter/descripcionStore_en.md)
- **Capturas de Pantalla 1080p:** Carpeta `docs/screenshots/` (4 capturas en español y 4 en inglés).

---

## 4. Comando para regenerar el paquete en futuras versiones

```powershell
npm run tauri:windows:build
# o directamente:
npx @choochmeque/tauri-windows-bundle build --runner npm
```
