<?php
declare(strict_types=1);

require_once __DIR__ . '/FieldType.php';

/**
 * IntakePayloadBuilder
 * --------------------
 * The single piece of "business logic" in this example. It turns the *flat*
 * data the browser collected --
 *
 *     answers   : { field_slug => value, ... }   (every visible field)
 *     files     : { field_slug => { filename, mime_type, base64 }, ... }
 *     products  : [ product_id, ... ]
 *     consents  : [ consent_key, ... ]            (keys the patient accepted)
 *
 * -- into the exact JSON contract that POST /telehealth/intake/unified expects,
 * using the encounter type's own schema as the routing table.
 *
 * Why drive everything off the schema:
 *   - A field's `maps_to` decides whether its value belongs in the structured
 *     patient{} / vitals{} / medical_history{} blocks or in the free-form
 *     answers{} map. The builder never hard-codes "patient_first_name" -- it
 *     reads maps_to=first_name and routes accordingly. Add a field to the
 *     encounter type in the PrescribeRx admin and it flows through with zero
 *     code changes here.
 *   - A field's `field_type` decides the *shape* of the value (array vs string
 *     vs object) and whether it is a file (-> documents[]).
 *
 * This class has no I/O. It is pure transformation, which makes it trivially
 * reusable: the AJAX proxy uses it, but so could a queued job, a CLI importer,
 * or a server-rendered form -- all feeding the same contract.
 */
final class IntakePayloadBuilder
{
    /** Map of schema `maps_to` value => target location in the API payload. */
    private const MAPS_TO_ROUTES = [
        // maps_to              => [block, key]
        'first_name'                    => ['patient', 'first_name'],
        'last_name'                     => ['patient', 'last_name'],
        'email'                         => ['patient', 'email'],
        'mobile_phone'                  => ['patient', 'phone'],
        'phone'                         => ['patient', 'phone'],
        'date_of_birth'                 => ['patient', 'date_of_birth'],
        'gender'                        => ['patient', 'gender'],
        'race'                          => ['patient', 'race'],
        'ethnicity'                     => ['patient', 'ethnicity'],
        'preferred_language'            => ['patient', 'preferred_language'],
        'addresses.primary'             => ['patient', 'address'],
        'height_inches'                 => ['vitals', 'height_inches'],
        'weight_lbs'                    => ['vitals', 'weight_lbs'],
        'heart_rate_bpm'                => ['vitals', 'heart_rate_bpm'],
        'allergies'                     => ['medical_history', 'allergies'],
        'medications'                   => ['medical_history', 'medications'],
        'conditions'                    => ['medical_history', 'conditions'],
        'drivers_license_number'        => ['identification', 'id_number'],
        'drivers_license_state_of_issue'=> ['identification', 'id_state'],
    ];

    private array $schema;            // decoded schema "data" object
    private array $fieldIndex;        // slug => field definition
    private array $documentTypeMap;   // slug => API document type
    private string $documentTypeDefault;
    private array $consentDefs;       // key => consent definition (from config)
    private array $requestMeta;       // ip_address / user_agent / source_domain

    /**
     * @param array  $schemaData          the "data" object from the schema endpoint
     * @param array  $documentTypeMap     file-slug => API document type
     * @param string $documentTypeDefault fallback document type
     * @param array  $consentDefs         consent definitions keyed by consent "key"
     * @param array  $requestMeta         ['ip_address'=>, 'user_agent'=>, 'source_domain'=>]
     */
    public function __construct(
        array $schemaData,
        array $documentTypeMap,
        string $documentTypeDefault,
        array $consentDefs,
        array $requestMeta
    ) {
        $this->schema              = $schemaData;
        $this->documentTypeMap     = $documentTypeMap;
        $this->documentTypeDefault = $documentTypeDefault;
        $this->consentDefs         = $consentDefs;
        $this->requestMeta         = $requestMeta;
        $this->fieldIndex          = $this->indexFields($schemaData);
    }

    /**
     * Build the full request body for POST /telehealth/intake/unified.
     */
    public function build(
        array $answers,
        array $files = [],
        array $productIds = [],
        array $acceptedConsentKeys = [],
        array $extra = []
    ): array {
        $payload = [
            'encounter_type_id' => $this->schema['encounter_type']['id'] ?? null,
            'patient'           => [],
        ];

        foreach ($answers as $slug => $value) {
            $field = $this->fieldIndex[$slug] ?? null;
            if ($field === null) {
                // Unknown slug: pass through to answers so nothing is silently
                // dropped. The API validates against its own schema anyway.
                $payload['answers'][$slug] = $value;
                continue;
            }

            $type = (int) ($field['field_type'] ?? FieldType::TEXT);

            if (FieldType::isDisplayOnly($type) || FieldType::isFile($type)) {
                continue; // headers/dividers carry no value; files handled below
            }

            $value = $this->normalizeValue($type, $value);
            if ($this->isEmpty($value)) {
                continue; // don't send blank optionals
            }

            $this->place($payload, $field, $type, $value);
        }

        // Files -> documents[]
        $documents = $this->buildDocuments($files);
        if ($documents) {
            $payload['documents'] = $documents;
        }

        // Products -> products[] (preferred nested shape)
        if ($productIds) {
            $payload['products'] = array_map(
                static fn($id) => ['product_id' => $id, 'quantity' => 1],
                array_values(array_unique($productIds))
            );
        }

        // Consents -> consents[]
        $consents = $this->buildConsents($acceptedConsentKeys);
        if ($consents) {
            $payload['consents'] = $consents;
        }

        // Caller-supplied extras (reason_for_visit, is_sandbox, client_id, ...)
        // win over anything above, by design.
        $payload = array_replace($payload, $extra);

        return $this->pruneEmpty($payload);
    }

    // --- routing ---------------------------------------------------------

    /**
     * Place a single normalized value into the correct block of the payload.
     */
    private function place(array &$payload, array $field, int $type, $value): void
    {
        $mapsTo = $field['maps_to'] ?? null;
        $slug   = $field['slug'];

        // Special composite types route to fixed locations regardless of maps_to.
        if ($type === FieldType::ADDRESS) {
            $payload['patient']['address'] = $this->shapeAddress($value);
            return;
        }
        if ($type === FieldType::BLOOD_PRESSURE) {
            $bp = is_array($value) ? $value : [];
            if (isset($bp['systolic']))  $payload['vitals']['blood_pressure_systolic']  = (int) $bp['systolic'];
            if (isset($bp['diastolic'])) $payload['vitals']['blood_pressure_diastolic'] = (int) $bp['diastolic'];
            return;
        }

        // maps_to-driven routing into structured blocks.
        if ($mapsTo !== null && isset(self::MAPS_TO_ROUTES[$mapsTo])) {
            [$block, $key] = self::MAPS_TO_ROUTES[$mapsTo];

            if ($mapsTo === 'height_inches') {
                $value = $this->toTotalInches($value);
            }
            if ($block === 'identification' && $key === 'id_number') {
                // If we collected a DL number, declare the id_type too.
                $payload['identification']['id_type'] = 'drivers_license';
            }

            $payload[$block][$key] = $value;

            // Some encounter types still want the raw answer recorded as well
            // (e.g. for audit). The API tolerates duplication, but to keep the
            // payload lean we only mirror clinical answers, not PII.
            return;
        }

        // Everything else is a clinical / free-form answer keyed by slug.
        $payload['answers'][$slug] = $value;
    }

    // --- value normalization --------------------------------------------

    /**
     * Coerce a raw browser value into the type the API expects.
     */
    private function normalizeValue(int $type, $value)
    {
        if (FieldType::isMultiValue($type)) {
            if (is_array($value)) {
                return array_values(array_filter($value, fn($v) => $v !== '' && $v !== null));
            }
            return ($value === '' || $value === null) ? [] : [$value];
        }

        switch ($type) {
            case FieldType::TOGGLE_SWITCH:
                return (bool) $value;

            case FieldType::YES_NO:
                // Normalize to the documented "Yes" | "No" casing.
                $s = strtolower(trim((string) $value));
                if (in_array($s, ['yes', 'y', 'true', '1'], true))  return 'Yes';
                if (in_array($s, ['no', 'n', 'false', '0'], true))  return 'No';
                return (string) $value;

            case FieldType::NUMBER:
            case FieldType::WEIGHT:
            case FieldType::HEART_RATE:
            case FieldType::TEMPERATURE:
            case FieldType::BLOOD_GLUCOSE:
            case FieldType::CURRENCY:
                return is_numeric($value) ? $value + 0 : $value;

            case FieldType::ALLERGY_SEARCH:
            case FieldType::MEDICATION_SEARCH:
            case FieldType::CONDITION_SEARCH:
                // Chip inputs arrive as arrays of free-text strings.
                return is_array($value) ? array_values(array_filter($value)) : [];

            default:
                return $value;
        }
    }

    /** Height arrives as {feet, inches}; the API wants total inches. */
    private function toTotalInches($value)
    {
        if (is_array($value)) {
            $feet   = (int) ($value['feet'] ?? 0);
            $inches = (int) ($value['inches'] ?? 0);
            return ($feet * 12) + $inches;
        }
        return is_numeric($value) ? (int) $value : $value;
    }

    private function shapeAddress($value): array
    {
        $a = is_array($value) ? $value : [];
        $out = [];
        foreach (['street', 'street2', 'city', 'state', 'zip', 'country'] as $k) {
            if (!empty($a[$k])) {
                $out[$k] = $a[$k];
            }
        }
        $out['country'] = $out['country'] ?? 'US';
        return $out;
    }

    // --- documents -------------------------------------------------------

    /**
     * @param array $files slug => { filename, mime_type, base64 }
     * @return array documents[] entries
     */
    private function buildDocuments(array $files): array
    {
        $docs = [];
        foreach ($files as $slug => $file) {
            if (empty($file['base64'])) {
                continue;
            }
            $docs[] = array_filter([
                'type'        => $this->documentTypeMap[$slug] ?? $this->documentTypeDefault,
                'filename'    => $file['filename'] ?? ($slug . '.bin'),
                'mime_type'   => $file['mime_type'] ?? null,
                'file_base64' => $file['base64'],
            ], fn($v) => $v !== null);
        }
        return $docs;
    }

    // --- consents --------------------------------------------------------

    /**
     * Turn the list of accepted consent keys into consents[] records, stamping
     * the capture context (when/where/how) the platform needs for audit.
     */
    private function buildConsents(array $acceptedKeys): array
    {
        $now = gmdate('Y-m-d\TH:i:s\Z');
        $records = [];

        foreach ($acceptedKeys as $key) {
            $def = $this->consentDefs[$key] ?? null;
            if ($def === null) {
                continue;
            }
            $records[] = array_filter([
                'consent_type'     => $def['type'],
                'consent_text'     => $def['text'],
                'consent_version'  => $def['version'] ?? null,
                'consented_at'     => $now,
                'ip_address'       => $this->requestMeta['ip_address'] ?? null,
                'user_agent'       => $this->requestMeta['user_agent'] ?? null,
                'source_domain'    => $this->requestMeta['source_domain'] ?? null,
                'signature_method' => 'click',
            ], fn($v) => $v !== null);
        }
        return $records;
    }

    // --- helpers ---------------------------------------------------------

    private function indexFields(array $schemaData): array
    {
        $index = [];
        foreach (($schemaData['steps'] ?? []) as $step) {
            foreach (($step['fields'] ?? []) as $field) {
                if (isset($field['slug'])) {
                    $index[$field['slug']] = $field;
                }
            }
        }
        return $index;
    }

    private function isEmpty($value): bool
    {
        if (is_array($value)) {
            return count($value) === 0;
        }
        return $value === '' || $value === null;
    }

    /** Drop empty arrays so we never send e.g. "patient": {} unexpectedly. */
    private function pruneEmpty(array $payload): array
    {
        foreach ($payload as $k => $v) {
            if (is_array($v) && count($v) === 0) {
                unset($payload[$k]);
            }
        }
        return $payload;
    }
}
