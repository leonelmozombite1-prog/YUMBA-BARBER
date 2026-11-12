<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/twilio_whatsapp.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$action = $_GET['action'] ?? '';

if (!file_exists(DB_FILE_PATH)) {
    http_response_code(500);
    echo json_encode(['error' => 'Base de datos JSON no inicializada.']);
    exit;
}

$db = json_decode((string) file_get_contents(DB_FILE_PATH), true);

if ($method === 'GET' && $action === 'bootstrap') {
    echo json_encode([
        'studioPhoneDisplay' => STUDIO_PHONE_DISPLAY,
        'studioPhoneRaw'     => '51967887427',
        'barbers'            => $db['barbers'] ?? [],
        'services'           => array_values(array_filter($db['services'] ?? [], fn($s) => !empty($s['active']))),
        'products'           => $db['products'] ?? [],
        'reviews'            => $db['reviews'] ?? [],
    ]);
    exit;
}

if ($method === 'POST' && $action === 'appointments') {
    $input = json_decode((string) file_get_contents('php://input'), true) ?: [];
    $clientName = trim((string) ($input['clientName'] ?? ''));
    $clientPhone = trim((string) ($input['clientPhone'] ?? ''));
    $barberId = (string) ($input['barberId'] ?? '');
    $serviceIds = $input['serviceIds'] ?? [];
    $date = (string) ($input['date'] ?? '');
    $time = (string) ($input['time'] ?? '');
    $paymentMethod = (string) ($input['paymentMethod'] ?? 'YAPE_PLIN');

    if ($clientName === '' || $clientPhone === '' || $barberId === '' || empty($serviceIds) || $date === '' || $time === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Completa todos los campos obligatorios.']);
        exit;
    }

    $selectedServices = array_values(array_filter($db['services'], fn($s) => in_array($s['id'], $serviceIds, true)));
    $total = array_reduce($selectedServices, fn($sum, $s) => $sum + (float) $s['price'], 0.0);
    $receiptId = 'REC-' . ($db['nextReceiptSeq'] ?? 102);
    $db['nextReceiptSeq'] = ($db['nextReceiptSeq'] ?? 102) + 1;

    $serviceListText = implode("\n", array_map(fn($s) => "• {$s['name']} (S/ " . number_format((float)$s['price'], 2) . ")", $selectedServices));
    $mensajeWhatsApp = "💈 *NUEVA RESERVA - YUMBA BARBER STUDIO*\n"
        . "Código: *{$receiptId}*\n"
        . "Cliente: *{$clientName}*\n"
        . "WhatsApp Cliente: {$clientPhone}\n"
        . "Fecha y Hora: *{$date} — {$time}*\n"
        . "Servicios:\n{$serviceListText}\n"
        . "Total a Pagar: *S/ " . number_format($total, 2) . "*\n"
        . "Método de Pago: {$paymentMethod}";

    $twilioResult = enviarNotificacionTwilioWhatsApp($receiptId, $mensajeWhatsApp);

    $appointment = [
        'id'            => $receiptId,
        'clientName'    => $clientName,
        'clientPhone'   => $clientPhone,
        'barberId'      => $barberId,
        'serviceNames'  => array_map(fn($s) => $s['name'], $selectedServices),
        'date'          => $date,
        'time'          => $time,
        'total'         => $total,
        'paymentMethod' => $paymentMethod,
        'status'        => 'Pendiente',
        'twilioStatus'  => $twilioResult['status'],
        'createdAt'     => gmdate('c'),
    ];

    array_unshift($db['appointments'], $appointment);
    file_put_contents(DB_FILE_PATH, json_encode($db, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    http_response_code(201);
    echo json_encode([
        'appointment'  => $appointment,
        'twilioResult' => $twilioResult,
    ]);
    exit;
}

http_response_code(404);
echo json_encode(['error' => 'Ruta PHP no encontrada']);
