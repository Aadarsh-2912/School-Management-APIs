const pool = require('../config/db');
const calculateDistance = require('../utils/distance');

// Add School Controller
exports.addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Input Validation
  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input: name, address, latitude, and longitude are required.' });
  }

  try {
    await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES ($1, $2, $3, $4)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully' });
  } catch (err) {
    console.error('Error inserting school:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// List Schools Controller
exports.listSchools = async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  // Coordinate Validation
  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'Invalid query parameters: latitude and longitude are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM schools');
    const schools = result.rows.map((school) => ({
      ...school,
      distance: calculateDistance(userLat, userLon, school.latitude, school.longitude),
    }));

    // Sort by distance
    schools.sort((a, b) => a.distance - b.distance);

    res.status(200).json(schools);
  } catch (err) {
    console.error('Error retrieving schools:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
