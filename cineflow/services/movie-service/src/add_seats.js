import { sequelize, Show, Seat } from './models/index.js';

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const shows = await Show.findAll();
    let addedCount = 0;

    for (const show of shows) {
      const rows = ['A', 'B', 'C', 'D', 'E'];
      const newSeats = [];
      
      for (const row of rows) {
        // Add seats 11 to 20
        for (let i = 11; i <= 20; i++) {
          newSeats.push({
            showId: show.id,
            seatNumber: `${row}${i}`,
            row,
            status: 'AVAILABLE',
            priceType: row === 'E' ? 'PREMIUM' : 'STANDARD'
          });
        }
      }

      // Check if they already exist
      const existing = await Seat.findOne({ where: { showId: show.id, seatNumber: 'A11' } });
      if (!existing) {
        await Seat.bulkCreate(newSeats);
        addedCount += newSeats.length;
      }
    }

    console.log(`Successfully added ${addedCount} new seats for all shows.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
