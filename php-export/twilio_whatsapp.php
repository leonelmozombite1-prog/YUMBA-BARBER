<?php
require_once __DIR__ . '/config.php';

/**
 * Envía un mensaje automático de WhatsApp al barbero (+51 967 887 427) usando la API REST de Twilio.
 */
function enviarNotificacionTwilioWhatsApp(string $appointmentId, string $mensaje): array
{
    $sid = trim(TWILIO_ACCOUNT_SID);
    $token = trim(TWILIO_AUTH_TOKEN);

    if ($sid === '' || $token === '') {
        return [
            'status' => 'pending_credentials',
            'detail' => 'Credenciales TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN no configuradas.',
        ];
    }

    $url = "https://api.twilio.com/2010-04-01/Accounts/" . rawurlencode($sid) . "/Messages.json";
    $postFields = http_build_query([
        'From' => TWILIO_WHATSAPP_FROM,
        'To'   => BARBER_WHATSAPP_TO,
        'Body' => $mensaje,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $postFields,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD        => $sid . ':' . $token,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_TIMEOUT        => 15,
    ]);

    $responseBody = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError !== '') {
        return [
            'status' => 'error',
            'detail' => 'Error cURL Twilio: ' . $curlError,
        ];
    }

    $decoded = json_decode((string) $responseBody, true);
    if ($httpCode < 200 || $httpCode >= 300) {
        return [
            'status' => 'error',
            'detail' => $decoded['message'] ?? "Error Twilio HTTP {$httpCode} ({$appointmentId})",
        ];
    }

    return [
        'status' => 'sent',
        'sid'    => $decoded['sid'] ?? null,
        'detail' => 'WhatsApp enviado automáticamente vía Twilio (' . ($decoded['status'] ?? 'queued') . ')',
    ];
}
