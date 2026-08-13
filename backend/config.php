<?php
// ── CORS ──────────────────────────────────────────────────
function cors(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
    header('Content-Type: application/json; charset=utf-8');
}

function ok(array $data = [], int $code = 200): void {
    http_response_code($code); echo json_encode($data); exit;
}

function err(string $message, int $code = 400): void {
    http_response_code($code); echo json_encode(['error' => $message]); exit;
}

function body(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}
