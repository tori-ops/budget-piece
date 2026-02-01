-- Wedding Budget Tool - Master Category Catalog (27 categories)
-- These are the global categories that can be enabled per event

-- 🧩 CORE (12 categories)
INSERT INTO public.categories (id, name, "group", base_weight, is_global, created_at, updated_at) VALUES
('cat_001', 'Venue & Rentals', 'CORE', 0.20, true, NOW(), NOW()),
('cat_002', 'Catering / Food', 'CORE', 0.18, true, NOW(), NOW()),
('cat_003', 'Bar / Alcohol', 'CORE', 0.08, true, NOW(), NOW()),
('cat_004', 'Photography', 'CORE', 0.12, true, NOW(), NOW()),
('cat_005', 'Videography', 'CORE', 0.08, true, NOW(), NOW()),
('cat_006', 'Planner / Coordination', 'CORE', 0.06, true, NOW(), NOW()),
('cat_007', 'Attire', 'CORE', 0.08, true, NOW(), NOW()),
('cat_008', 'Florals', 'CORE', 0.07, true, NOW(), NOW()),
('cat_009', 'Music / Entertainment', 'CORE', 0.07, true, NOW(), NOW()),
('cat_010', 'Officiant', 'CORE', 0.01, true, NOW(), NOW()),
('cat_011', 'Cake / Desserts', 'CORE', 0.03, true, NOW(), NOW()),
('cat_012', 'Hair & Makeup', 'CORE', 0.02, true, NOW(), NOW()),

-- 🧾 ADMIN (5 categories)
('cat_013', 'Taxes, Service Fees & Delivery', 'ADMIN', 0.06, true, NOW(), NOW()),
('cat_014', 'Tips / Gratuities', 'ADMIN', 0.05, true, NOW(), NOW()),
('cat_015', 'Permits & Licenses', 'ADMIN', 0.01, true, NOW(), NOW()),
('cat_016', 'Postage & Mailing', 'ADMIN', 0.01, true, NOW(), NOW()),
('cat_017', 'Insurance', 'ADMIN', 0.02, true, NOW(), NOW()),

-- ✨ ENHANCEMENTS (8 categories)
('cat_018', 'Decor Enhancements (Non-floral)', 'ENHANCEMENTS', 0.04, true, NOW(), NOW()),
('cat_019', 'Signage & Stationery', 'ENHANCEMENTS', 0.01, true, NOW(), NOW()),
('cat_020', 'Lighting & Draping', 'ENHANCEMENTS', 0.03, true, NOW(), NOW()),
('cat_021', 'Transportation', 'ENHANCEMENTS', 0.03, true, NOW(), NOW()),
('cat_022', 'Guest Experience', 'ENHANCEMENTS', 0.02, true, NOW(), NOW()),
('cat_023', 'Favors', 'ENHANCEMENTS', 0.01, true, NOW(), NOW()),
('cat_024', 'Late-Night Snack', 'ENHANCEMENTS', 0.01, true, NOW(), NOW()),
('cat_025', 'Bridal Party Gifts', 'ENHANCEMENTS', 0.02, true, NOW(), NOW()),

-- 🛟 SAFETY NET (1 category)
('cat_026', 'Contingency / Flex Fund', 'SAFETY_NET', 0.10, true, NOW(), NOW()),

-- 🧩 FLEX (1 category)
('cat_027', 'Miscellaneous / Other', 'FLEX', 0.03, true, NOW(), NOW());

-- Note: Total base weights should sum to ~1.0 for normalization
-- The allocation engine will calculate effective weights based on tier multipliers
