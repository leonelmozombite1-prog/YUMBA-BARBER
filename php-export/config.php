<?php
// Configuración de YUMBA Barber Studio - Desarrollado por ING. Jhojan

define('STUDIO_PHONE_DISPLAY', '+51 967 887 427');
define('BARBER_WHATSAPP_TO', 'whatsapp:+51967887427');
define('ADMIN_PIN', getenv('ADMIN_PIN') ?: 'yumba2026');

// Credenciales de Twilio (configurar variables de entorno o reemplazar aquí en producción)
define('TWILIO_ACCOUNT_SID', getenv('TWILIO_ACCOUNT_SID') ?: '');
define('TWILIO_AUTH_TOKEN', getenv('TWILIO_AUTH_TOKEN') ?: '');
define('TWILIO_WHATSAPP_FROM', getenv('TWILIO_WHATSAPP_FROM') ?: 'whatsapp:+14155238886');

define('DB_FILE_PATH', __DIR__ . '/../data/yumba-db.json');
