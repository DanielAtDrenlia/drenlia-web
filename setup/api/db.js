const getAllProjects = async () => {
  try {
    const result = await db.all(`
      SELECT p.*, pt.type, pt.fr_type
      FROM projects p
      LEFT JOIN project_types pt ON p.type_id = pt.type_id
      ORDER BY p.display_order ASC
    `);
    return result;
  } catch (error) {
    console.error('Error getting projects:', error);
    throw error;
  }
};

const createProject = async (project) => {
  try {
    const result = await db.run(`
      INSERT INTO projects (
        title, description, display_order, image_url, 
        fr_title, fr_description, type_id, status,
        git_url, demo_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      project.title, project.description, project.display_order, project.image_url,
      project.fr_title, project.fr_description, project.type_id, project.status || 'pending-approval',
      project.git_url, project.demo_url
    ]);
    return { success: true, id: result.lastID };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

const updateProject = async (project) => {
  try {
    await db.run(`
      UPDATE projects SET
        title = ?, description = ?, display_order = ?, image_url = ?,
        fr_title = ?, fr_description = ?, type_id = ?, status = ?,
        git_url = ?, demo_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE project_id = ?
    `, [
      project.title, project.description, project.display_order, project.image_url,
      project.fr_title, project.fr_description, project.type_id, project.status || 'pending-approval',
      project.git_url, project.demo_url, project.project_id
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}; 