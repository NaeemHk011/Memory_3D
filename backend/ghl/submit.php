<?php
/**
 * GHL Order Submission
 * React checkout → ImgBB photo upload → GHL contact upsert
 * → GHL opportunity → GHL note with full order details
 */

require_once __DIR__ . '/../config.php';
cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') err('Method not allowed', 405);

$b = body();

$name      = trim($b['name']        ?? '');
$email     = trim($b['email']       ?? '');
$phone     = trim($b['phone']       ?? '');
$cartItems = $b['cartItems']        ?? [];
$total     = (float)($b['totalPrice']   ?? 0);
$photoB64       = $b['photoBase64']       ?? null;
$framedPhotoB64 = $b['framedPhotoBase64'] ?? null;
$photoName      = $b['photoName']         ?? 'photo.jpg';

if (!$name || !$email) err('Name and email are required');

// ── Credentials from .htaccess SetEnv ────────────────────────────
$GHL_TOKEN    = getenv('GHL_PRIVATE_TOKEN') ?: '';
$GHL_LOC      = getenv('GHL_LOCATION_ID')   ?: '';
$GHL_PIPELINE = getenv('GHL_PIPELINE_ID')   ?: '';
$GHL_STAGE    = getenv('GHL_STAGE_ID')      ?: '';
$IMGBB_KEY    = getenv('IMGBB_API_KEY')      ?: '';

if (!$GHL_TOKEN || !$GHL_LOC || !$GHL_PIPELINE || !$GHL_STAGE) {
    err('Server misconfigured: missing GHL environment variables', 500);
}

// ── Helper: cURL GET / POST / PUT ────────────────────────────────
function curlRequest(string $method, string $url, array $headers, string $body = ''): array {
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
    ];
    if ($method !== 'GET' && $body !== '') {
        $opts[CURLOPT_POSTFIELDS] = $body;
    }
    curl_setopt_array($ch, $opts);
    $resp   = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [
        'status' => $status,
        'data'   => json_decode($resp ?: '{}', true) ?? [],
        'raw'    => $resp,
    ];
}

// ── 1. Upload photos to ImgBB ─────────────────────────────────────
function uploadToImgBB(string $key, string $base64raw, string $name): ?string {
    $ch = curl_init("https://api.imgbb.com/1/upload?key={$key}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['image' => $base64raw, 'name' => $name]),
        CURLOPT_TIMEOUT        => 30,
    ]);
    $json = json_decode(curl_exec($ch) ?: '{}', true) ?? [];
    curl_close($ch);
    return $json['data']['url'] ?? null;
}

$photoUrl       = null;
$framedPhotoUrl = null;

if ($photoB64 && $IMGBB_KEY) {
    $raw = preg_replace('#^data:image/\w+;base64,#', '', $photoB64);
    $photoUrl = uploadToImgBB($IMGBB_KEY, $raw, $photoName);
}

if ($framedPhotoB64 && $IMGBB_KEY) {
    $raw = preg_replace('#^data:image/\w+;base64,#', '', $framedPhotoB64);
    $framedPhotoUrl = uploadToImgBB($IMGBB_KEY, $raw, 'framed_' . $photoName);
}

// ── GHL headers ───────────────────────────────────────────────────
$ghlHeaders = [
    "Authorization: Bearer {$GHL_TOKEN}",
    "Version: 2021-07-28",
    "Content-Type: application/json",
];

// ── 2. Find or create GHL Contact (search by email, then create if missing) ──
$parts     = explode(' ', $name, 2);
$firstName = $parts[0];
$lastName  = $parts[1] ?? '';

// Search for existing contact by email in this location
$searchUrl  = 'https://services.leadconnectorhq.com/contacts/'
            . '?locationId=' . urlencode($GHL_LOC)
            . '&query='      . urlencode($email);
$searchResp = curlRequest('GET', $searchUrl, $ghlHeaders);
$contactId  = $searchResp['data']['contacts'][0]['id'] ?? null;

if ($contactId) {
    // Contact exists — update name/phone and add tag so record stays fresh
    curlRequest('PUT',
        "https://services.leadconnectorhq.com/contacts/{$contactId}",
        $ghlHeaders,
        json_encode([
            'firstName' => $firstName,
            'lastName'  => $lastName,
            'phone'     => $phone,
            'tags'      => ['3D Crystal Order'],
        ])
    );
} else {
    // No matching contact — create a brand-new one
    $createResp = curlRequest('POST',
        'https://services.leadconnectorhq.com/contacts/',
        $ghlHeaders,
        json_encode([
            'firstName'  => $firstName,
            'lastName'   => $lastName,
            'email'      => $email,
            'phone'      => $phone,
            'locationId' => $GHL_LOC,
            'tags'       => ['3D Crystal Order'],
        ])
    );

    if ($createResp['status'] >= 400) {
        err('Failed to create GHL contact: ' . ($createResp['raw'] ?? ''), 500);
    }

    $contactId = $createResp['data']['contact']['id'] ?? $createResp['data']['id'] ?? null;
}

if (!$contactId) err('Could not resolve GHL contact ID', 500);

// ── 3. Create GHL Opportunity ─────────────────────────────────────
$labels = array_map(function($i) {
    $s  = $i['shapeLabel'] ?? '';
    $sz = $i['sizeLabel']  ?? '';
    return $sz ? "{$s} ({$sz})" : $s;
}, $cartItems ?: []);
$orderName = (implode(', ', $labels) ?: 'Order') . ' — Order #' . time();

$oppResp = curlRequest('POST',
    'https://services.leadconnectorhq.com/opportunities/',
    $ghlHeaders,
    json_encode([
        'name'            => $orderName,
        'contactId'       => $contactId,
        'pipelineId'      => $GHL_PIPELINE,
        'pipelineStageId' => $GHL_STAGE,
        'status'          => 'open',
        'monetaryValue'   => $total,
        'locationId'      => $GHL_LOC,
    ])
);

// Duplicate opportunity → update existing
if ($oppResp['status'] === 400 && !empty($oppResp['data']['meta']['existingId'])) {
    $existingId = $oppResp['data']['meta']['existingId'];
    curlRequest('PUT',
        "https://services.leadconnectorhq.com/opportunities/{$existingId}",
        $ghlHeaders,
        json_encode(['name' => $orderName, 'status' => 'open', 'monetaryValue' => $total])
    );
} elseif ($oppResp['status'] >= 400) {
    err('Failed to create GHL opportunity', 500);
}

// ── 4. Add Order Note ─────────────────────────────────────────────
$lines = [
    "ORDER DETAILS",
    "=============",
    "Customer : {$name}",
    "Email    : {$email}",
    "Phone    : {$phone}",
    "Order    : {$orderName}",
    "Total    : $" . number_format($total, 2),
    "",
    "ITEMS:",
];

foreach ($cartItems as $item) {
    $shape  = $item['shapeLabel'] ?? '';
    $size   = $item['sizeLabel']  ?? '';
    $price  = number_format((float)($item['price'] ?? 0), 2);
    $lines[] = "  • {$shape}" . ($size ? " | {$size}" : '') . "  \${$price}";

    foreach ($item['addons'] ?? [] as $addon) {
        $qty    = (int)($addon['qty'] ?? 1);
        $aTotal = number_format((float)($addon['price'] ?? 0) * $qty, 2);
        $lines[] = "      + {$addon['label']}" . ($qty > 1 ? " x{$qty}" : '') . "  \${$aTotal}";
    }

    if (!empty($item['inscriptionText'])) {
        $lines[] = "      Inscription: \"{$item['inscriptionText']}\"";
    }
}

$lines[] = '';
$lines[] = $photoUrl       ? "Original Photo : {$photoUrl}"        : "No photo uploaded.";
$lines[] = $framedPhotoUrl ? "Framed Preview : {$framedPhotoUrl}"  : "No framed preview (positioning not used).";

curlRequest('POST',
    "https://services.leadconnectorhq.com/contacts/{$contactId}/notes",
    $ghlHeaders,
    json_encode(['body' => implode("\n", $lines)])
);

ok(['success' => true]);
