-- Insert user
INSERT INTO users (id, email, created_at, updated_at)
VALUES (
  '391ac2b1-a770-4165-a9cc-0b4da7681e69',
  'vkoleski10@gmail.com',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert profile
INSERT INTO profiles (id, display_name, created_at, updated_at)
VALUES (
  '391ac2b1-a770-4165-a9cc-0b4da7681e69',
  'Tori Walker',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
