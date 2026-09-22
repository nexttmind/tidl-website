<?php
declare(strict_types=1);

/**
 * PrescribeRxClient
 * -----------------
 * A thin, dependency-free cURL wrapper around the PrescribeRx REST API.
 *
 * Responsibilities (and nothing more):
 *   - attach the bearer token + mandatory headers to every request
 *   - perform GET / POST against /api/v1/*
 *   - normalize transport + HTTP errors into a single exception type
 *   - light file-based response caching (used for the schema, which is
 *     stable for the life of an encounter type)
 *
 * It contains NO knowledge of intake payloads or field mapping -- that lives
 * in IntakePayloadBuilder. Keeping the HTTP concern isolated means the same
 * client backs the schema lookup, the product lookup, and the submit call,
 * and could back any future endpoint without change.
 *
 * In a Laravel app this maps to a Http-macro-backed service / connector class
 * resolved out of the container; here it is plain PHP so the example runs on
 * any host with the cURL extension.
 */
final class PrescribeRxClient
{
    private string $baseUrl;
    private string $token;
    private int $timeout;
    private ?string $cacheDir;
    private int $cacheTtl;

    /**
     * @param string      $baseUrl  e.g. https://demo.prescribe-rx.com/api/v1
     * @param string      $token    Bearer token (server-side secret)
     * @param int         $timeout  seconds
     * @param string|null $cacheDir absolute writable path, or null to disable
     * @param int         $cacheTtl seconds to keep a cached GET response
     */
    public function __construct(
        string $baseUrl,
        string $token,
        int $timeout = 30,
        ?string $cacheDir = null,
        int $cacheTtl = 300
    ) {
        $this->baseUrl  = rtrim($baseUrl, '/');
        $this->token    = $token;
        $this->timeout  = $timeout;
        $this->cacheDir = $cacheDir;
        $this->cacheTtl = $cacheTtl;
    }

    /**
     * GET a path (relative to base URL). $query is appended as a query string.
     * Successful GETs are cached on disk for $cacheTtl seconds when caching
     * is enabled.
     *
     * @return array decoded JSON body
     */
    public function get(string $path, array $query = []): array
    {
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        if ($query) {
            $url .= '?' . http_build_query($query);
        }

        $cacheKey = $this->cacheKey('GET', $url);
        $cached   = $this->cacheRead($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        $result = $this->request('GET', $url, null);
        $this->cacheWrite($cacheKey, $result);
        return $result;
    }

    /**
     * POST a JSON body to a path. Never cached.
     *
     * @return array decoded JSON body
     */
    public function post(string $path, array $body): array
    {
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        return $this->request('POST', $url, $body);
    }

    /**
     * Execute the request and normalize the outcome.
     *
     * @throws PrescribeRxApiException on transport failure or non-2xx status
     */
    private function request(string $method, string $url, ?array $body): array
    {
        $headers = [
            'Accept: application/json',
            'Authorization: Bearer ' . $this->token,
        ];

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            // Production TLS posture. Never disable verification for a
            // platform that handles PHI.
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        if ($body !== null) {
            $headers[] = 'Content-Type: application/json';
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body, JSON_UNESCAPED_SLASHES));
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        $raw    = curl_exec($ch);
        $errno  = curl_errno($ch);
        $error  = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($errno !== 0) {
            throw new PrescribeRxApiException(
                'Transport error contacting PrescribeRx: ' . $error,
                0,
                null
            );
        }

        $decoded = json_decode((string) $raw, true);
        if (!is_array($decoded)) {
            // A non-JSON body almost always means a missing Accept header
            // (302 to web login) or an upstream 5xx HTML error page.
            throw new PrescribeRxApiException(
                'PrescribeRx returned a non-JSON response (HTTP ' . $status . '). '
                . 'Check the token and that Accept: application/json is sent.',
                $status,
                null
            );
        }

        if ($status < 200 || $status >= 300) {
            $message = $decoded['message'] ?? ('Request failed with HTTP ' . $status);
            throw new PrescribeRxApiException($message, $status, $decoded);
        }

        return $decoded;
    }

    // --- tiny file cache -------------------------------------------------

    private function cacheKey(string $method, string $url): string
    {
        return sha1($method . ' ' . $url);
    }

    private function cacheRead(string $key): ?array
    {
        if ($this->cacheDir === null) {
            return null;
        }
        $file = $this->cacheDir . '/prx_' . $key . '.json';
        if (!is_file($file)) {
            return null;
        }
        if ((time() - filemtime($file)) > $this->cacheTtl) {
            @unlink($file);
            return null;
        }
        $data = json_decode((string) file_get_contents($file), true);
        return is_array($data) ? $data : null;
    }

    private function cacheWrite(string $key, array $data): void
    {
        if ($this->cacheDir === null) {
            return;
        }
        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0700, true);
        }
        @file_put_contents(
            $this->cacheDir . '/prx_' . $key . '.json',
            json_encode($data, JSON_UNESCAPED_SLASHES)
        );
    }
}

/**
 * Single exception type for any API failure. Carries the HTTP status and the
 * decoded error body (which, for 422s, includes Laravel's `errors` map) so the
 * proxy can relay field-level validation errors back to the browser.
 */
final class PrescribeRxApiException extends \RuntimeException
{
    private int $httpStatus;
    private ?array $body;

    public function __construct(string $message, int $httpStatus, ?array $body)
    {
        parent::__construct($message);
        $this->httpStatus = $httpStatus;
        $this->body       = $body;
    }

    public function httpStatus(): int { return $this->httpStatus; }
    public function body(): ?array { return $this->body; }

    /** Laravel-style validation errors map ({field: [messages]}) if present. */
    public function validationErrors(): array
    {
        return $this->body['errors'] ?? [];
    }
}
