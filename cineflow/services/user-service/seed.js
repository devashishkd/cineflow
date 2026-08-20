import 'dotenv/config';
import bcrypt from 'bcryptjs';
import User from './src/models/user.model.js';
import sequelize from './src/config/db.js';

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database for seeding...');

    await sequelize.sync({ force: true }); 

    console.log('🌱 Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    await User.bulkCreate([
      { name: 'John Doe', email: 'john@example.com', passwordHash },
      { name: 'Jane Smith', email: 'jane@example.com', passwordHash },
      { name: 'Admin User', email: 'admin@cineflow.com', passwordHash },
    ]);

    console.log('🎉 Users seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
