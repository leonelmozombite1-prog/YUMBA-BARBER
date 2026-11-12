# Exportación PHP 8 para YUMBA Barber Studio

Desarrollado por **ING. Jhojan**.

Este directorio contiene la implementación nativa en **PHP 8 + cURL** para desplegar el backend de reservas y notificaciones automáticas de WhatsApp vía **Twilio API** hacia `+51 967 887 427` en servidores Apache, Nginx, XAMPP o cPanel.

## Configuración rápida en PHP
1. Copia la carpeta del proyecto compilado (`npm run build` -> carpeta `dist/`), la carpeta `data/` y `php-export/` a tu servidor Apache/XAMPP (`htdocs/yumba`).
2. Configura las variables de entorno o edita `php-export/config.php` con tus credenciales de Twilio:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_FROM` (por defecto `whatsapp:+14155238886` en Sandbox o tu número WhatsApp Business aprobado).
3. El número destino del barbero ya está configurado como `whatsapp:+51967887427`.
