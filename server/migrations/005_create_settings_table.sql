-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('site_name', 'Drenlia'),
    ('site_description', 'Drenlia - Your Trusted Partner in Construction'),
    ('contact_email', 'contact@drenlia.com'),
    ('contact_phone', '+1 (555) 123-4567'),
    ('address', '123 Construction Ave, Building City, ST 12345'); 