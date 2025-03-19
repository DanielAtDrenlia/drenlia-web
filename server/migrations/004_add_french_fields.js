/**
 * Add French fields to about and team tables
 */

exports.up = function(db) {
  // Add French fields to about table
  db.exec(`
    ALTER TABLE about 
    ADD COLUMN fr_title TEXT;
  `);
  
  db.exec(`
    ALTER TABLE about 
    ADD COLUMN fr_description TEXT;
  `);

  // Add French fields to team table
  db.exec(`
    ALTER TABLE team 
    ADD COLUMN fr_title TEXT;
  `);
  
  db.exec(`
    ALTER TABLE team 
    ADD COLUMN fr_bio TEXT;
  `);
};

exports.down = function(db) {
  // Remove French fields from about table
  db.exec(`
    ALTER TABLE about 
    DROP COLUMN fr_title;
  `);
  
  db.exec(`
    ALTER TABLE about 
    DROP COLUMN fr_description;
  `);

  // Remove French fields from team table
  db.exec(`
    ALTER TABLE team 
    DROP COLUMN fr_title;
  `);
  
  db.exec(`
    ALTER TABLE team 
    DROP COLUMN fr_bio;
  `);
}; 