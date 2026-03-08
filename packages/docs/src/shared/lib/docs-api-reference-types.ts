export interface EnumValue {
  value: string;
  description?: string;
}

export interface ApiParameter {
  name: string;
  /** Display TypeScript type for docs (may differ from runtime types). */
  type: string;
  description: string;
  required?: boolean;
  default?: string;
  /** When set, renders an allowed-values table under this parameter. */
  enumValues?: EnumValue[];
}

export interface ApiReturns {
  type: string;
  description: string;
}

export type ApiKind = 'function' | 'class' | 'interface' | 'constant' | 'enum';

export interface ApiEntry {
  id: string;
  name: string;
  kind?: ApiKind;
  signature?: string;
  description: string;
  parameters?: ApiParameter[];
  returns?: ApiReturns;
  useCase?: string;
  example: string;
  relatedApis?: string[];
  enumValues?: EnumValue[];
}

export interface ApiCategory {
  id: string;
  label: string;
  description: string;
  entries: ApiEntry[];
}

/** Metadata for a docs API entry before `id` and `example` are attached. */
export type ApiReferenceEntryInput = Omit<ApiEntry, 'id' | 'example'>;
