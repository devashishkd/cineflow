import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Show from '../modules/shows/show.model.js';
import Seat from '../modules/shows/seat.model.js';

const addSeatsToShows = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    const shows = await Show.findAll();
    console.log(`Found ${shows.length} shows.`);

    const rows = ['A', 'B', 'C', 'D', 'E'];
    let totalAdded = 0;

    for (const show of shows) {
      const existingSeats = await Seat.findAll({
        where: { showId: show.id },
        attributes: ['seatNumber']
      });
      const existingSeatSet = new Set(existingSeats.map(s => s.seatNumber));

      const newSeats = [];
      for (const row of rows) {
        for (let col = 11; col <= 20; col++) {
          const seatNumber = `${row}${col}`;
          if (!existingSeatSet.has(seatNumber)) {
            newSeats.push({
              showId: show.id,
              seatNumber,
              row,
              status: 'AVAILABLE',
            });
          }
        }
      }

      if (newSeats.length > 0) {
        await Seat.bulkCreate(newSeats);
        totalAdded += newSeats.length;
        console.log(`Added ${newSeats.length} seats to show ${show.id}`);
      }
    }

    console.log(`✅ Successfully added ${totalAdded} total seats across all shows.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding seats:', error);
    process.exit(1);
  }
};

addSeatsToShows();
