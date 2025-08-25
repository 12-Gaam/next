-- Insert initial data
INSERT INTO country_master (name) VALUES 
  ('India'),
  ('United States'),
  ('United Kingdom'),
  ('Canada'),
  ('Australia')
ON CONFLICT (name) DO NOTHING;

-- Insert Indian states
INSERT INTO state_master (name, country_id) 
SELECT 'Maharashtra', id FROM country_master WHERE name = 'India'
UNION ALL
SELECT 'Delhi', id FROM country_master WHERE name = 'India'
UNION ALL
SELECT 'Karnataka', id FROM country_master WHERE name = 'India'
UNION ALL
SELECT 'Tamil Nadu', id FROM country_master WHERE name = 'India'
UNION ALL
SELECT 'Gujarat', id FROM country_master WHERE name = 'India'
ON CONFLICT DO NOTHING;

-- Insert education levels
INSERT INTO education_master (name) VALUES 
  ('High School'),
  ('Bachelor''s Degree'),
  ('Master''s Degree'),
  ('PhD'),
  ('Diploma'),
  ('Certificate Course'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Insert professions
INSERT INTO profession_master (name) VALUES 
  ('Software Engineer'),
  ('Doctor'),
  ('Teacher'),
  ('Business Owner'),
  ('Manager'),
  ('Student'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (username, password_hash, role) VALUES 
  ('admin', '$2a$10$rQZ8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K3Q8K', 'admin')
ON CONFLICT (username) DO NOTHING;
