UPDATE operator_config SET 
  canned_questions = '[
    {"label": "Tell me about this profile", "value": "Tell me about the profile I am currently viewing"},
    {"label": "Good for outdoors?", "value": "Is the profile I am viewing rated for outdoor use?"},
    {"label": "What mounting options exist?", "value": "What mounting hardware options are available for this profile?"},
    {"label": "Face-lit vs halo — what is the difference?", "value": "What is the difference between face-lit and halo-lit letter profiles?"},
    {"label": "What materials are available?", "value": "What materials do you offer for fabricated letter profiles?"},
    {"label": "How long does production take?", "value": "What are your standard lead times for fabricated letters?"}
  ]'::jsonb,
  context_instruction = 'SAFETY RULES — MANDATORY: 1. NEVER provide electrical advice, wiring instructions, voltage recommendations, or any guidance that could cause injury, death, or property damage. 2. NEVER advise on sign installation, mounting procedures, structural engineering, or building code compliance. 3. ONLY provide information about our product specifications, materials, finishes, profile types, and ordering process. 4. If asked about electrical work, installation, or anything outside product specs, respond: For safety, we do not provide electrical or installation advice. Please consult a licensed electrician or sign installer. We are happy to help with product specifications and ordering. 5. All answers must be limited to product features, materials, construction methods, and ordering — never field work.'
WHERE id = (SELECT id FROM operator_config LIMIT 1);