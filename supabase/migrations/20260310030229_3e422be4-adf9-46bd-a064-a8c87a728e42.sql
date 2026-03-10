
INSERT INTO spec_options (profile_type, field_name, label, options, sort_order, required) VALUES
-- Halo Lit
('Halo Lit', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Halo Lit', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Halo Lit', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Halo Lit', 'led_color', 'LED Color', '["3000K","4000K","6500K","Red","Green","Blue","RGB","None"]', 4, true),
('Halo Lit', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 5, true),
('Halo Lit', 'back_type', 'Back Type', '["None","Aluminum","Diffused Acrylic","5mm Poly","10mm PVC","15mm White Acrylic","30mm White Acrylic"]', 6, false),
('Halo Lit', 'lead_wires', 'Lead Wires', '["3 ft","5 ft","10 ft","15 ft","20 ft"]', 7, false),
('Halo Lit', 'ul_label', 'UL Label', '["Top of Return","Side of Return","Bottom of Return","Inside Back"]', 8, false),
('Halo Lit', 'wire_exit', 'Wire Exit', '["Top","Bottom","Left","Right","Back"]', 9, false),

-- Front Lit
('Front Lit', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Front Lit', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Front Lit', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Front Lit', 'led_color', 'LED Color', '["3000K","4000K","6500K","Red","Green","Blue","RGB","None"]', 4, true),
('Front Lit', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 5, true),
('Front Lit', 'acrylic_face', 'Acrylic Face', '["White 3mm","White 5mm","Clear 3mm","Clear 5mm","Opal 3mm","Opal 5mm","None"]', 6, true),
('Front Lit', 'lead_wires', 'Lead Wires', '["3 ft","5 ft","10 ft","15 ft","20 ft"]', 7, false),
('Front Lit', 'ul_label', 'UL Label', '["Top of Return","Side of Return","Bottom of Return","Inside Back"]', 8, false),
('Front Lit', 'wire_exit', 'Wire Exit', '["Top","Bottom","Left","Right","Back"]', 9, false),

-- Back Lit
('Back Lit', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Back Lit', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Back Lit', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Back Lit', 'led_color', 'LED Color', '["3000K","4000K","6500K","Red","Green","Blue","RGB","None"]', 4, true),
('Back Lit', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 5, true),
('Back Lit', 'lead_wires', 'Lead Wires', '["3 ft","5 ft","10 ft","15 ft","20 ft"]', 6, false),
('Back Lit', 'ul_label', 'UL Label', '["Top of Return","Side of Return","Bottom of Return","Inside Back"]', 7, false),
('Back Lit', 'wire_exit', 'Wire Exit', '["Top","Bottom","Left","Right","Back"]', 8, false),

-- Front & Back Lit
('Front & Back Lit', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Front & Back Lit', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Front & Back Lit', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Front & Back Lit', 'led_color', 'LED Color', '["3000K","4000K","6500K","Red","Green","Blue","RGB","None"]', 4, true),
('Front & Back Lit', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 5, true),
('Front & Back Lit', 'back_type', 'Back Type', '["None","Aluminum","Diffused Acrylic","5mm Poly","10mm PVC","15mm White Acrylic","30mm White Acrylic"]', 6, false),
('Front & Back Lit', 'acrylic_face', 'Acrylic Face', '["White 3mm","White 5mm","Clear 3mm","Clear 5mm","Opal 3mm","Opal 5mm","None"]', 7, true),
('Front & Back Lit', 'lead_wires', 'Lead Wires', '["3 ft","5 ft","10 ft","15 ft","20 ft"]', 8, false),
('Front & Back Lit', 'ul_label', 'UL Label', '["Top of Return","Side of Return","Bottom of Return","Inside Back"]', 9, false),
('Front & Back Lit', 'wire_exit', 'Wire Exit', '["Top","Bottom","Left","Right","Back"]', 10, false),

-- Non-Illuminated
('Non-Illuminated', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Non-Illuminated', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Non-Illuminated', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Non-Illuminated', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 4, true),

-- Open Face Neon
('Open Face Neon', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Open Face Neon', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Open Face Neon', 'depth', 'Returns / Depth', '["0.5\"","1\"","1.5\"","2\"","3\"","4\"","5\"","6\""]', 3, true),
('Open Face Neon', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 4, true),
('Open Face Neon', 'back_type', 'Back Type', '["None","Aluminum","Diffused Acrylic","5mm Poly","10mm PVC","15mm White Acrylic","30mm White Acrylic"]', 5, false),

-- Edge Lit
('Edge Lit', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Edge Lit', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Edge Lit', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 3, true),
('Edge Lit', 'acrylic_face', 'Acrylic Face', '["White 3mm","White 5mm","Clear 3mm","Clear 5mm","Opal 3mm","Opal 5mm","None"]', 4, true),
('Edge Lit', 'led_color', 'LED Color', '["3000K","4000K","6500K","Red","Green","Blue","RGB","None"]', 5, true),

-- Flat Cut
('Flat Cut', 'metal_type', 'Metal', '["SS304","SS316","Aluminum","Brass","Copper","Corten","Zinc","Black PVD","Bronze PVD","Gold PVD","Rose Gold PVD"]', 1, true),
('Flat Cut', 'finish', 'Finish', '["Brushed H","Brushed V","Mirror","Hairline","Soft Satin","Vibration","Painted Matte","Painted Gloss","Painted Satin","Painted Metallic","Aged Brass","Patina Copper","Raw"]', 2, true),
('Flat Cut', 'mounting', 'Mounting', '["Flush Stud","Standoff","Back Plate","Direct Mount","French Cleat","L-Clips","Shadow Free","Strap","Top Mount","Bottom Mount","Side Mount","Removable Can"]', 3, true);
