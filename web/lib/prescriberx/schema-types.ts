export type SchemaOption = {
  label: string;
  value: string;
};

export type SchemaDependency = {
  field?: string;
  slug?: string;
  operator?: string;
  value?: unknown;
};

export type SchemaField = {
  slug: string;
  label: string;
  field_type: number;
  is_required?: boolean;
  help_text?: string | null;
  placeholder?: string | null;
  options?: SchemaOption[] | null;
  validation?: string[] | null;
  depends_on?: SchemaDependency | null;
  maps_to?: string | null;
  min?: number | null;
  max?: number | null;
};

export type SchemaStep = {
  step_name: string;
  step_description?: string | null;
  step_type: number;
  display_order?: number;
  is_required?: boolean;
  fields?: SchemaField[];
};

export type EncounterSchemaData = {
  encounter_type: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  };
  steps: SchemaStep[];
};

export type UploadedDoc = {
  slug: string;
  filename: string;
  mime_type: string;
  base64: string;
};

export type ConsentDef = {
  key: string;
  type: number;
  version: string;
  required: boolean;
  label: string;
  text: string;
  documentHref?: string;
  documentLabel?: string;
};
