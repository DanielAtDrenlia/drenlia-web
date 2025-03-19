-- Add French language fields to about table
ALTER TABLE about ADD COLUMN fr_title TEXT;
ALTER TABLE about ADD COLUMN fr_description TEXT;

-- Add French language fields to team table
ALTER TABLE team ADD COLUMN fr_title TEXT;
ALTER TABLE team ADD COLUMN fr_bio TEXT;

-- Update triggers for about table
DROP TRIGGER IF EXISTS update_about_timestamp;
CREATE TRIGGER update_about_timestamp 
AFTER UPDATE ON about
BEGIN
    UPDATE about SET updated_at = CURRENT_TIMESTAMP 
    WHERE about_id = NEW.about_id;
END;

-- Update triggers for team table
DROP TRIGGER IF EXISTS update_team_timestamp;
CREATE TRIGGER update_team_timestamp 
AFTER UPDATE ON team
BEGIN
    UPDATE team SET updated_at = CURRENT_TIMESTAMP 
    WHERE team_id = NEW.team_id;
END; 