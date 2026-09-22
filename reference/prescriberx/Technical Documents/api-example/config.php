<?php
declare(strict_types=1);

/**
 * Configuration
 * -------------
 * The ONE place you edit to deploy this example. Nothing secret ever reaches
 * the browser -- the API token lives here, on the server, and is only ever
 * read by api.php.
 *
 * For real deployments, prefer environment variables over hard-coding the
 * token (see PRESCRIBE_RX_TOKEN below).
 */

return [

    // -- API connection --------------------------------------------------

    // Base URL INCLUDING the /api/v1 prefix.
    'api_base_url' => getenv('PRESCRIBE_RX_BASE_URL')
        ?: 'https://demo.prescribe-rx.com/api/v1',

    // Server-side bearer token. Issue a token whose user type carries the
    // `telehealth:submit`, `telehealth:read` and `encounter:create` abilities
    // (Sales Organization, Client, or API user types -- see the Token Types
    // matrix in the API docs).
    //
    // The value below is a public, auto-rotating SANDBOX token from the demo
    // docs. Replace it with your own. NEVER commit a production token.
    'api_token' => getenv('PRESCRIBE_RX_TOKEN')
        ?: '807|C4l7GRl02sEodbEsdnT66Z38hCCt7H6klMTTFXEne2f52b16',

    'http_timeout' => 30,

    // Schema/products responses are cached on disk for this many seconds to
    // avoid re-fetching on every page load. Set 0 / null cache_dir to disable.
    'cache_dir' => sys_get_temp_dir() . '/prx_intake_cache',
    'cache_ttl' => 300,

    // -- Encounter type --------------------------------------------------

    // Default encounter type the wizard loads. GLP-1 Screening on the demo.
    // The wizard lets the user switch types; this is just the initial value.
    'default_encounter_type_id' => '019ce396-46a1-73ab-87d6-c40310555401',

    // Which step_type values are patient-facing and should render in the
    // wizard. The remaining ones (10-14: Chart Review, Provider Assessment,
    // Prescribing, SOAP, Finalize) are provider/back-office steps and are
    // deliberately excluded. Observed patient step types:
    //   1=standard fields, 2=health questions, 3=product selection,
    //   4=consent, 5=checkout, 21=confirmation, 22=identity verification.
    'patient_step_types' => [1, 2, 3, 4, 5, 21, 22],

    // step_type 21 (Confirmation) is rendered as the success screen, not as a
    // navigable form step.
    'confirmation_step_type' => 21,

    // -- File field -> API document type --------------------------------
    // File-upload fields (field_type 21) are sent in documents[] with a typed
    // category. Map each file field's slug to the API document type. Anything
    // not listed falls back to document_type_default.
    'document_type_map' => [
        'id_front'         => 'government_id_front',
        'id_back'          => 'government_id_back',
        'passport'         => 'government_id_passport',
        'selfie'           => 'selfie_with_id',
        'body_photo'       => 'body_picture',
        'lab_result'       => 'lab_result_pdf',
        'insurance_front'  => 'insurance_card_front',
        'insurance_back'   => 'insurance_card_back',
    ],
    'document_type_default' => 'other_document',

    // Upload limits enforced client- and server-side. API max is 10MB/file,
    // 20 files. Keep these <= the API limits.
    'max_file_bytes' => 10 * 1024 * 1024,
    'max_files'      => 20,
    'allowed_upload_mime' => [
        'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf',
    ],

    // -- Consents --------------------------------------------------------
    // The schema's Consent step carries no fields, so the consent text is
    // defined here and rendered as checkboxes. Each accepted checkbox becomes
    // one consents[] record. consent_type integers (from the API):
    //   1=HIPAA 2=TCPA 3=SMS 4=Email 5=Terms 6=Telehealth
    //   7=Controlled 8=Privacy 9=BAA 10=Disclosure 99=Custom
    'consents' => [
        'telehealth' => [
            'type'     => 6,
            'version'  => '1.0',
            'required' => true,
            'label'    => 'I consent to a telehealth consultation',
            'text'     => 'I consent to receive care via telehealth, understand its '
                        . 'benefits and limitations, and authorize the treating '
                        . 'provider to evaluate my intake responses.',
        ],
        'hipaa' => [
            'type'     => 1,
            'version'  => '1.0',
            'required' => true,
            'label'    => 'I acknowledge the Notice of Privacy Practices (HIPAA)',
            'text'     => 'I acknowledge receipt of the Notice of Privacy Practices '
                        . 'describing how my protected health information may be '
                        . 'used and disclosed.',
        ],
        'sms' => [
            'type'     => 3,
            'version'  => '1.0',
            'required' => false,
            'label'    => 'I agree to receive SMS updates about my care (optional)',
            'text'     => 'I agree to receive text messages related to my treatment, '
                        . 'appointments, and order status. Message and data rates '
                        . 'may apply. Reply STOP to opt out.',
        ],
    ],

    // -- Submission behavior ---------------------------------------------

    // When true, every intake is flagged is_sandbox (skips provider
    // assignment, fulfillment, billing). Turn OFF for production traffic.
    'sandbox_mode' => true,

    // Optional tenant routing. Leave null to fall back to the token's tenant.
    'client_id'    => null,
    'sales_org_id' => null,
];
