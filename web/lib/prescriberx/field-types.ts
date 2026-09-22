/** PrescribeRx EncounterFieldType integers. */

export const FieldType = {
  TEXT: 1,
  EMAIL: 2,
  NUMBER: 3,
  PHONE: 4,
  DATE: 5,
  TEXTAREA: 6,
  PASSWORD: 7,
  URL: 8,
  SELECT: 10,
  MULTISELECT: 11,
  RADIO_GROUP: 12,
  RADIO_BUTTONS: 13,
  CHECKBOX_GROUP: 14,
  TOGGLE_SWITCH: 15,
  YES_NO: 16,
  TOGGLE_GROUP: 17,
  TYPEAHEAD: 20,
  FILE_UPLOAD: 21,
  SIGNATURE_PAD: 22,
  CALENDAR: 23,
  TIME: 24,
  DATETIME: 25,
  RANGE_SLIDER: 27,
  CURRENCY: 28,
  ALLERGY_SEARCH: 30,
  MEDICATION_SEARCH: 31,
  CONDITION_SEARCH: 32,
  HEIGHT: 40,
  WEIGHT: 41,
  BMI: 42,
  BLOOD_PRESSURE: 43,
  ADDRESS: 44,
  FULL_NAME: 45,
  HEART_RATE: 46,
  TEMPERATURE: 47,
  BLOOD_GLUCOSE: 48,
  SECTION_HEADER: 60,
  DIVIDER: 61,
  HIDDEN: 80,
} as const;

export type FieldTypeId = (typeof FieldType)[keyof typeof FieldType];

export const PATIENT_STEP_TYPES = new Set([1, 2, 4, 5, 22]);
/** Product confirmation is implied by the merchandising entry; skip in UI. */
export const PRODUCT_CONFIRM_STEP_TYPE = 3;
export const CONFIRMATION_STEP_TYPE = 21;

export function isDisplayOnly(type: number): boolean {
  return (
    type === FieldType.SECTION_HEADER ||
    type === FieldType.DIVIDER ||
    type === FieldType.HIDDEN ||
    type === FieldType.BMI
  );
}

export function isFileType(type: number): boolean {
  return type === FieldType.FILE_UPLOAD || type === FieldType.SIGNATURE_PAD;
}

export function isChipSearch(type: number): boolean {
  return (
    type === FieldType.ALLERGY_SEARCH ||
    type === FieldType.MEDICATION_SEARCH ||
    type === FieldType.CONDITION_SEARCH
  );
}
