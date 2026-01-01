<?php
include_once 'database_config.php';

$CLIENT_ID     = LM_CLIENT_ID;
$CLIENT_SECRET = CLIENT_SECRET;
$TOKEN_URL     = "https://apimanager.lantmateriet.se/oauth2/token";
$WMTS_BASE     = "https://maps.lantmateriet.se/open/topowebb-ccby/v1/wmts";
$LAYER         = "topowebb";
$MATRIX_SET    = "3857";

// Grundläggande validering
$z = isset($_GET['z']) ? (int)$_GET['z'] : null;
$x = isset($_GET['x']) ? (int)$_GET['x'] : null;
$y = isset($_GET['y']) ? (int)$_GET['y'] : null;
if ($z === null || $x === null || $y === null) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "Bad request: missing z/x/y";
    exit;
}

// --- Enkel filcache för access token ---
$cacheDir = sys_get_temp_dir() . '/lm_proxy_cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0700, true);
}
$tokenFile = $cacheDir . '/access_token.json';

function getAccessToken(string $tokenUrl, string $clientId, string $clientSecret, string $tokenFile): string {
    // Återanvänd om giltigt
    if (file_exists($tokenFile)) {
        $data = json_decode((string)file_get_contents($tokenFile), true);
        if (isset($data['access_token'], $data['expires_at']) && time() < ((int)$data['expires_at'] - 30)) {
            return $data['access_token'];
        }
    }

    // Hämta nytt token via Client Credentials (se API-portalen)
    // POST x-www-form-urlencoded med Basic Auth (client_id:client_secret)
    $ch = curl_init($tokenUrl);
    $postFields = http_build_query(['grant_type' => 'client_credentials']); // ev. 'scope' om din tjänst kräver
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_HTTPAUTH => CURLAUTH_BASIC,
        CURLOPT_USERPWD => $clientId . ':' . $clientSecret,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10
    ]);
    $resp = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($resp === false || $http < 200 || $http >= 300) {
        http_response_code(502);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Token request failed ($http): " . curl_error($ch);
        curl_close($ch);
        exit;
    }
    curl_close($ch);

    $json = json_decode((string)$resp, true);
    if (!isset($json['access_token'], $json['expires_in'])) {
        http_response_code(502);
        header('Content-Type: text/plain; charset=utf-8');
        echo "Invalid token response";
        exit;
    }

    $json['expires_at'] = time() + (int)$json['expires_in'];
    @file_put_contents($tokenFile, json_encode($json, JSON_UNESCAPED_SLASHES));
    return $json['access_token'];
}

$accessToken = getAccessToken($TOKEN_URL, $CLIENT_ID, $CLIENT_SECRET, $tokenFile);

// --- Bygg WMTS-tile URL ---
$wmtsUrl = sprintf(
    '%s/1.0.0/%s/default/%s/%d/%d/%d.png',
    $WMTS_BASE,
    rawurlencode($LAYER),
    rawurlencode($MATRIX_SET),
    $z, $y, $x
);

// Hämta tile med Authorization-header
$ch = curl_init($wmtsUrl);
curl_setopt_array($ch, [
    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $accessToken],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_TIMEOUT => 10
]);
$tileData = curl_exec($ch);
$http     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: 'image/png';
$curlErr = curl_error($ch);
curl_close($ch);

if ($tileData === false || $http >= 400) {
    http_response_code($http ?: 502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "WMTS fetch failed ($http): $curlErr";
    exit;
}

header('Content-Type: ' . $contentType);
header('Cache-Control: public, max-age=86400, s-maxage=86400'); // 1 dag
header('X-Content-Type-Options: nosniff');

// Skicka vidare bilden
echo $tileData;
