-- Add email column to team table if it doesn't exist
ALTER TABLE team ADD COLUMN IF NOT EXISTS email TEXT;

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('site_name', 'Drenlia'),
    ('site_description', 'Cloud Services & Solutions'),
    ('contact_email', 'info@drenlia.com'),
    ('contact_phone', '+1 (555) 123-4567'),
    ('address', '123 Main St, City, Country'); 