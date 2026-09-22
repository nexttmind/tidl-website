<?php
declare(strict_types=1);

/**
 * api.php -- AJAX proxy / thin controller
 * ---------------------------------------
 * The ONLY server endpoint the browser talks to. It exists so the API token
 * never leaves the server and so all contract logic stays in PHP.
 *
 * Actions (all JSON in / JSON out):
 *   GET  ?action=encounter_types
 *        -> list of encounter types (for the type switcher)
 *   GET  ?action=bootstrap&encounter_type_id=UUID
 *        -> { schema, products, consents, limits, patient_step_types }
 *           everything the wizard needs to render one encounter type
 *   POST  { action:"submit", encounter_type_id, answers, files, products,
 *           accepted_consents, reason_for_visit }
 *        -> forwards a built payload to /telehealth/intake/unified
 *
 * The browser sends RAW values keyed by field slug. This controller re-fetches
 * the authoritative schema and hands everything to IntakePayloadBuilder, so the
 * client can never dictate how data is mapped into the API contract.
 */

require_once __DIR__ . '/lib/PrescribeRxClient.php';
require_once __DIR__ . '/lib/IntakePayloadBuilder.php';

$config = require __DIR__ . '/config.php';

header('Content-Type: application/json');

// Convert otherwise-fatal errors (parse/require failures, out-of-memory, etc.)
// into a JSON body. Without this, a fatal can produce an empty 200/500 response
// that surfaces in the browser as "Unexpected end of JSON input".
register_shutdown_function(static function (): void {
    $e = error_get_last();
    if ($e !== null && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        if (!headers_sent()) {
            http_response_code(500);
        }
        echo json_encode([
            'success' => false,
            'message' => 'Server error: ' . $e['message'],
        ], JSON_UNESCAPED_SLASHES);
    }
});
// Same-origin is assumed (the wizard is served from the same host). If you
// host the form on a different origin, set an explicit allow-list here instead
// of "*", and never reflect arbitrary Origins.
// header('Access-Control-Allow-Origin: https://your-form-host.example');

/** Emit a JSON response and stop. */
function respond(int $status, array $body): void
{
    http_response_code($status);

    // Substitute invalid UTF-8 and tolerate partial-encode failures so we never
    // emit an empty body (an empty body surfaces in the browser as the cryptic
    // "Unexpected end of JSON input").
    $json = json_encode(
        $body,
        JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_PARTIAL_OUTPUT_ON_ERROR
    );

    if ($json === false) {
        // Last-resort fallback: encoding still failed. Send a minimal, guaranteed
        // -valid JSON error rather than nothing at all.
        http_response_code(500);
        $json = json_encode([
            'success' => false,
            'message' => 'Server failed to encode the response: ' . json_last_error_msg(),
        ]);
    }

    echo $json;
    exit;
}

if ($config['api_token'] === 'PASTE_YOUR_SERVER_SIDE_TOKEN_HERE') {
    respond(500, [
        'success' => false,
        'message' => 'Server not configured: set api_token in config.php (or the PRESCRIBE_RX_TOKEN env var).',
    ]);
}

$client = new PrescribeRxClient(
    $config['api_base_url'],
    $config['api_token'],
    (int) $config['http_timeout'],
    $config['cache_dir'] ?? null,
    (int) ($config['cache_ttl'] ?? 300)
);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Read the request. Two transports are supported on POST:
//   1. multipart/form-data (preferred for submit): a JSON "payload" part plus
//      real binary file parts. Files stream as uploads governed by PHP's
//      upload_max_filesize, instead of inflating a JSON body with base64.
//   2. application/json (no files, or programmatic callers): the raw JSON body.
$input = [];
$files = [];
if ($method === 'POST') {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'multipart/form-data') !== false) {
        // If the body exceeded post_max_size, PHP discards $_POST/$_FILES and we
        // get an empty $_POST despite a non-zero Content-Length. Surface that
        // clearly instead of behaving as though no data was sent.
        if (empty($_POST) && (int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            respond(413, [
                'success' => false,
                'message' => 'Upload too large for the server. The request exceeded post_max_size'
                    . ' (currently ' . ini_get('post_max_size') . '). Increase post_max_size,'
                    . ' upload_max_filesize, and your web server body limit (e.g. nginx'
                    . ' client_max_body_size), or upload fewer/smaller files.',
            ]);
        }
        $input = json_decode((string) ($_POST['payload'] ?? '[]'), true) ?: [];
        $files = collectUploads($config); // validates count/size/MIME, returns base64 entries
    } else {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw ?: '[]', true) ?: [];
        // Legacy JSON path: files inlined as { slug: { filename, mime_type, base64 } }.
        $files = (array) ($input['files'] ?? []);
        validateUploads($files, $config);
    }
}

$action = $_GET['action'] ?? ($input['action'] ?? null);

try {
    switch ($action) {

        // ---------------------------------------------------------------
        case 'encounter_types':
            $res = $client->get('/telehealth/encounter-types');
            respond(200, ['success' => true, 'data' => $res['data'] ?? []]);
            // no break needed; respond() exits

        // ---------------------------------------------------------------
        case 'bootstrap':
            $typeId = $_GET['encounter_type_id'] ?? $config['default_encounter_type_id'];
            if (!$typeId) {
                respond(422, ['success' => false, 'message' => 'encounter_type_id is required.']);
            }

            $schema = $client->get("/telehealth/encounter-types/{$typeId}/schema");

            // Products are optional and tenant-dependent; tolerate failure.
            $products = [];
            try {
                $pres = $client->get('/telehealth/products', ['encounter_type_id' => $typeId]);
                $products = $pres['data'] ?? [];
            } catch (PrescribeRxApiException $e) {
                // leave products empty
            }

            // Surface only the consent metadata the browser needs to render --
            // never anything sensitive.
            $consents = [];
            foreach ($config['consents'] as $key => $def) {
                $consents[] = [
                    'key'      => $key,
                    'label'    => $def['label'],
                    'text'     => $def['text'],
                    'required' => (bool) $def['required'],
                ];
            }

            respond(200, [
                'success'  => true,
                'schema'   => $schema['data'] ?? [],
                'meta'     => $schema['meta'] ?? [],
                'products' => $products,
                'consents' => $consents,
                'patient_step_types'     => $config['patient_step_types'],
                'confirmation_step_type' => $config['confirmation_step_type'],
                'limits'   => [
                    'max_file_bytes'      => $config['max_file_bytes'],
                    'max_files'           => $config['max_files'],
                    'allowed_upload_mime' => $config['allowed_upload_mime'],
                ],
            ]);

        // ---------------------------------------------------------------
        case 'submit':
            if ($method !== 'POST') {
                respond(405, ['success' => false, 'message' => 'Use POST for submit.']);
            }

            $typeId = $input['encounter_type_id'] ?? $config['default_encounter_type_id'];
            $answers  = (array) ($input['answers'] ?? []);
            $products = (array) ($input['products'] ?? []);
            $accepted = (array) ($input['accepted_consents'] ?? []);
            // $files was collected + validated during request parsing above
            // (from multipart $_FILES, or from the legacy inline-JSON path).

            // Re-fetch the authoritative schema for routing.
            $schema = $client->get("/telehealth/encounter-types/{$typeId}/schema");

            $builder = new IntakePayloadBuilder(
                $schema['data'] ?? [],
                $config['document_type_map'],
                $config['document_type_default'],
                $config['consents'],
                [
                    'ip_address'    => $_SERVER['REMOTE_ADDR'] ?? null,
                    'user_agent'    => $_SERVER['HTTP_USER_AGENT'] ?? null,
                    'source_domain' => $_SERVER['HTTP_HOST'] ?? null,
                ]
            );

            // Caller-controlled extras layered on top of the built payload.
            $extra = ['encounter_type_id' => $typeId];
            if (!empty($config['sandbox_mode'])) {
                $extra['is_sandbox'] = true;
            }
            if (!empty($config['client_id']))    $extra['client_id']    = $config['client_id'];
            if (!empty($config['sales_org_id'])) $extra['sales_org_id'] = $config['sales_org_id'];
            if (!empty($input['reason_for_visit'])) {
                $extra['reason_for_visit'] = substr((string) $input['reason_for_visit'], 0, 500);
            }

            $payload = $builder->build($answers, $files, $products, $accepted, $extra);

            $result = $client->post('/telehealth/intake/unified', $payload);
            respond(201, ['success' => true, 'data' => $result['data'] ?? $result]);

        // ---------------------------------------------------------------
        default:
            respond(400, ['success' => false, 'message' => 'Unknown action.']);
    }
} catch (PrescribeRxApiException $e) {
    // Relay API validation/auth errors to the browser intact so the wizard can
    // highlight offending fields.
    respond($e->httpStatus() ?: 502, [
        'success' => false,
        'message' => $e->getMessage(),
        'errors'  => $e->validationErrors(),
    ]);
} catch (\Throwable $e) {
    respond(500, ['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Reject oversized / disallowed / too-many uploads before they reach the API.
 */
function validateUploads(array $files, array $config): void
{
    if (count($files) > (int) $config['max_files']) {
        respond(422, ['success' => false, 'message' => 'Too many files uploaded.']);
    }
    foreach ($files as $slug => $file) {
        $b64 = $file['base64'] ?? '';
        if ($b64 === '') {
            continue;
        }
        // Approx decoded size from base64 length.
        $bytes = (int) (strlen($b64) * 3 / 4);
        if ($bytes > (int) $config['max_file_bytes']) {
            respond(422, [
                'success' => false,
                'message' => "File for '{$slug}' exceeds the size limit.",
            ]);
        }
        $mime = $file['mime_type'] ?? '';
        if ($mime && !in_array($mime, $config['allowed_upload_mime'], true)) {
            respond(422, [
                'success' => false,
                'message' => "File type '{$mime}' for '{$slug}' is not allowed.",
            ]);
        }
    }
}

/**
 * Collect multipart uploads (field name "files[slug]") into the same shape the
 * builder consumes: [ slug => ['filename','mime_type','base64'] ]. Validates
 * against the REAL uploaded bytes (size + sniffed MIME), which is stronger than
 * trusting a client-declared size/type and matches the API's server-side sniff.
 */
function collectUploads(array $config): array
{
    $out = [];
    if (empty($_FILES['files']) || !is_array($_FILES['files']['name'] ?? null)) {
        return $out;
    }
    $names = $_FILES['files']['name'];

    $present = array_filter($names, static fn($n) => $n !== '' && $n !== null);
    if (count($present) > (int) $config['max_files']) {
        respond(422, ['success' => false, 'message' => 'Too many files uploaded.']);
    }

    $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;

    foreach ($names as $slug => $name) {
        $err = $_FILES['files']['error'][$slug] ?? UPLOAD_ERR_NO_FILE;
        if ($err === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            respond(422, ['success' => false, 'message' => "File for '{$slug}' exceeds the server upload size limit (upload_max_filesize)."]);
        }
        if ($err !== UPLOAD_ERR_OK) {
            respond(422, ['success' => false, 'message' => "Upload failed for '{$slug}' (error code {$err})."]);
        }

        $tmp  = $_FILES['files']['tmp_name'][$slug] ?? '';
        $size = (int) ($_FILES['files']['size'][$slug] ?? 0);
        if ($tmp === '' || !is_uploaded_file($tmp)) {
            respond(422, ['success' => false, 'message' => "Invalid upload for '{$slug}'."]);
        }
        if ($size > (int) $config['max_file_bytes']) {
            respond(422, ['success' => false, 'message' => "File for '{$slug}' exceeds the size limit."]);
        }

        // Authoritative MIME via content sniff; fall back to the declared type.
        $mime = $finfo ? (finfo_file($finfo, $tmp) ?: '') : (string) ($_FILES['files']['type'][$slug] ?? '');
        if ($mime && $config['allowed_upload_mime'] && !in_array($mime, $config['allowed_upload_mime'], true)) {
            respond(422, ['success' => false, 'message' => "File type '{$mime}' for '{$slug}' is not allowed."]);
        }

        $bytes = file_get_contents($tmp);
        $out[$slug] = [
            'filename'  => basename((string) $name),
            'mime_type' => $mime,
            'base64'    => base64_encode($bytes !== false ? $bytes : ''),
        ];
    }

    if ($finfo) {
        finfo_close($finfo);
    }
    return $out;
}
