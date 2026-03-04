// Sign specification constants — hardcoded for MVP, will migrate to Supabase later

export const SPEC_FIELDS_BY_PROFILE: Record<string, string[]> = {
  'Halo Lit': ['metal_type', 'finish', 'depth', 'led_color', 'mounting', 'back_type', 'lead_wires', 'ul_label', 'wire_exit'],
  'Front Lit': ['metal_type', 'finish', 'depth', 'led_color', 'mounting', 'acrylic_face', 'lead_wires', 'ul_label', 'wire_exit'],
  'Back Lit': ['metal_type', 'finish', 'depth', 'led_color', 'mounting', 'lead_wires', 'ul_label', 'wire_exit'],
  'Front & Back Lit': ['metal_type', 'finish', 'depth', 'led_color', 'mounting', 'back_type', 'acrylic_face', 'lead_wires', 'ul_label', 'wire_exit'],
  'Non-Illuminated': ['metal_type', 'finish', 'depth', 'mounting'],
  'Open Face Neon': ['metal_type', 'finish', 'depth', 'mounting', 'back_type'],
  'Edge Lit': ['metal_type', 'finish', 'mounting', 'acrylic_face', 'led_color'],
  'Flat Cut': ['metal_type', 'finish', 'mounting'],
};

export const FIELD_LABELS: Record<string, string> = {
  metal_type: 'Metal',
  finish: 'Finish',
  depth: 'Returns / Depth',
  led_color: 'LED Color',
  mounting: 'Mounting',
  back_type: 'Back Type',
  acrylic_face: 'Acrylic Face',
  lead_wires: 'Lead Wires',
  ul_label: 'UL Label',
  wire_exit: 'Wire Exit',
};

export const CATEGORY_MAP: Record<string, string> = {
  metal_type: 'metal',
  finish: 'finish',
  depth: 'depth',
  led_color: 'led',
  mounting: 'mounting',
  back_type: 'back',
  acrylic_face: 'acrylic',
  ul_label: 'ul_label',
  wire_exit: 'wire_exit',
};

export const PROFILE_DEFAULTS: Record<string, Record<string, string>> = {
  'Halo Lit': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    depth: '2"',
    led_color: '3000K',
    mounting: 'Flush Stud',
    back_type: 'None',
    lead_wires: '5 ft',
    ul_label: 'Top of Return',
    wire_exit: 'Top',
  },
  'Front Lit': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    depth: '2"',
    led_color: '3000K',
    mounting: 'Flush Stud',
    acrylic_face: 'White 5mm',
    lead_wires: '5 ft',
    ul_label: 'Top of Return',
    wire_exit: 'Top',
  },
  'Back Lit': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    depth: '1.5"',
    led_color: '3000K',
    mounting: 'Standoff',
    lead_wires: '5 ft',
    ul_label: 'Top of Return',
    wire_exit: 'Top',
  },
  'Front & Back Lit': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    depth: '2"',
    led_color: '3000K',
    mounting: 'Flush Stud',
    back_type: 'Diffused Acrylic',
    acrylic_face: 'White 5mm',
    lead_wires: '5 ft',
    ul_label: 'Top of Return',
    wire_exit: 'Top',
  },
  'Non-Illuminated': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    depth: '1"',
    mounting: 'Flush Stud',
  },
  'Open Face Neon': {
    metal_type: 'Aluminum',
    finish: 'Painted Matte',
    depth: '3"',
    mounting: 'Direct Mount',
    back_type: 'Aluminum',
  },
  'Edge Lit': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    mounting: 'Standoff',
    acrylic_face: 'Clear 5mm',
    led_color: '3000K',
  },
  'Flat Cut': {
    metal_type: 'SS304',
    finish: 'Brushed H',
    mounting: 'Flush Stud',
  },
};

export const PROFILE_TYPES = [
  'Halo Lit',
  'Front Lit',
  'Back Lit',
  'Front & Back Lit',
  'Non-Illuminated',
  'Open Face Neon',
  'Edge Lit',
  'Flat Cut',
] as const;
