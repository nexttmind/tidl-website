<?php
declare(strict_types=1);

/**
 * FieldType
 * ---------
 * Mirror of the PrescribeRx `EncounterFieldType` integer enum (see the
 * OpenAPI spec: components.schemas.EncounterFieldType.x-labels).
 *
 * This class is the single source of truth for how the example treats each
 * field type. The browser engine (assets/wizard.js) renders inputs by these
 * same integers, and IntakePayloadBuilder uses the classification helpers
 * below to decide *where* a value goes in the API payload and *how* it is
 * shaped.
 *
 * To support a new field type end-to-end you only touch two places:
 *   1. Add the constant + (optionally) a classification set here.
 *   2. Register a renderer for the integer in assets/wizard.js (RENDERERS map).
 * No other file needs to change. That is the whole point of keeping the type
 * table centralized.
 */
final class FieldType
{
    // --- Text-like -------------------------------------------------------
    public const TEXT            = 1;
    public const EMAIL           = 2;
    public const NUMBER          = 3;
    public const PHONE           = 4;
    public const DATE            = 5;
    public const TEXTAREA        = 6;
    public const PASSWORD        = 7;
    public const URL             = 8;

    // --- Choice ----------------------------------------------------------
    public const SELECT          = 10; // dropdown -> single value (string)
    public const MULTISELECT     = 11; // -> string[]
    public const RADIO_GROUP     = 12; // -> single value (string)
    public const RADIO_BUTTONS   = 13; // styled radios -> single value (string)
    public const CHECKBOX_GROUP  = 14; // -> string[]
    public const TOGGLE_SWITCH   = 15; // -> boolean
    public const YES_NO          = 16; // -> "Yes" | "No"
    public const TOGGLE_GROUP    = 17; // multi -> string[]

    // --- Rich / specialized ---------------------------------------------
    public const TYPEAHEAD       = 20;
    public const FILE_UPLOAD     = 21; // -> documents[]
    public const SIGNATURE_PAD   = 22; // -> documents[] (base64 image) or consent signature
    public const CALENDAR        = 23;
    public const TIME            = 24;
    public const DATETIME        = 25;
    public const RANGE_SLIDER    = 27;
    public const CURRENCY        = 28;

    // --- Clinical search (chips) ----------------------------------------
    public const ALLERGY_SEARCH    = 30; // -> medical_history.allergies[]
    public const MEDICATION_SEARCH = 31; // -> medical_history.medications[]
    public const CONDITION_SEARCH  = 32; // -> medical_history.conditions[]

    // --- Vitals / composite ---------------------------------------------
    public const HEIGHT          = 40; // {feet,inches} -> total inches
    public const WEIGHT          = 41; // number (lbs)
    public const BMI             = 42; // computed, not submitted
    public const BLOOD_PRESSURE  = 43; // {systolic,diastolic}
    public const ADDRESS         = 44; // object
    public const FULL_NAME       = 45;
    public const HEART_RATE      = 46;
    public const TEMPERATURE     = 47;
    public const BLOOD_GLUCOSE   = 48;

    // --- Workflow / structural ------------------------------------------
    public const SCORED_ASSESSMENT  = 49;
    public const TREATMENT_INDICATION = 50;
    public const CONSENT_CHECKBOX   = 51;
    public const PRODUCT_SELECTION  = 52;
    public const DOSE_SELECTION     = 53;
    public const SECTION_HEADER     = 60; // display only
    public const DIVIDER            = 61; // display only
    public const HIDDEN             = 80;

    /** Field types whose value is an array of option values. */
    public const MULTI_VALUE = [
        self::MULTISELECT,
        self::CHECKBOX_GROUP,
        self::TOGGLE_GROUP,
    ];

    /** Field types collected as uploaded files and routed to documents[]. */
    public const FILE_TYPES = [
        self::FILE_UPLOAD,
        self::SIGNATURE_PAD,
    ];

    /** Display-only field types that never produce a submitted value. */
    public const DISPLAY_ONLY = [
        self::SECTION_HEADER,
        self::DIVIDER,
        self::BMI, // BMI is derived from height + weight, not collected
    ];

    public static function isMultiValue(int $type): bool
    {
        return in_array($type, self::MULTI_VALUE, true);
    }

    public static function isFile(int $type): bool
    {
        return in_array($type, self::FILE_TYPES, true);
    }

    public static function isDisplayOnly(int $type): bool
    {
        return in_array($type, self::DISPLAY_ONLY, true);
    }
}
