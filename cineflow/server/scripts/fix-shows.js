/**
 * Fix: Add shows for all now-showing movies across all theatres for next 7 days
 * This ensures movies are bookable regardless of which city is selected.
 */

const BASE_URL = 'http://localhost:3000/api';

async function fixShows() {
  // ── Step 1: Login ─────────────────────────────────────────────────────────
  console.log('Authenticating...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@gmail.com', password: '123456' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error('Login failed: ' + loginData.message);
  const token = loginData.data.token;
  console.log('Authenticated as ADMIN.');

  // ── Step 2: Fetch all now-showing movies ──────────────────────────────────
  const moviesRes = await fetch(`${BASE_URL}/movies?status=now_showing&limit=100`);
  const moviesData = await moviesRes.json();
  const movies = moviesData.data || [];
  console.log(`Found ${movies.length} now-showing movies.`);

  // ── Step 3: Fetch all theatres ────────────────────────────────────────────
  const theatresRes = await fetch(`${BASE_URL}/theatres`);
  const theatresData = await theatresRes.json();
  const theatres = theatresData.data || [];
  console.log(`Found ${theatres.length} theatres: ${theatres.map(t => `${t.name} (${t.city})`).join(', ')}`);

  // ── Step 4: Generate next 7 days ──────────────────────────────────────────
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
  console.log('Will create shows for dates:', dates.join(', '));

  // Show times and prices
  const showSlots = [
    { time: '10:30:00', price: 250 },
    { time: '14:00:00', price: 300 },
    { time: '18:00:00', price: 350 },
    { time: '21:30:00', price: 400 },
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const movie of movies) {
    for (const theatre of theatres) {
      // Fetch existing shows for this movie + theatre
      const existingRes = await fetch(`${BASE_URL}/shows/movie/${movie.id}?theatreId=${theatre.id}`);
      const existingData = await existingRes.json();
      const existing = existingData.data || [];
      const existingDates = new Set(existing.map(s => s.showDate));

      for (const date of dates) {
        if (existingDates.has(date)) {
          skipped++;
          continue; // Show already exists for this date/theatre/movie
        }

        // Pick 2 time slots per day (vary by movie to spread them out)
        const slotOffset = (movie.title.charCodeAt(0) + theatre.name.charCodeAt(0)) % 2;
        const slotsToCreate = [showSlots[slotOffset], showSlots[slotOffset + 2]];

        for (const slot of slotsToCreate) {
          const body = {
            movieId: movie.id,
            theatreId: theatre.id,
            showDate: date,
            showTime: slot.time,
            price: slot.price,
            totalSeats: 100,
          };

          const res = await fetch(`${BASE_URL}/shows`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            created++;
          } else {
            const errData = await res.json();
            console.error(`  Error for "${movie.title}" @ ${theatre.name} on ${date}:`, errData.message);
            errors++;
          }
        }
      }
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Created : ${created} new shows`);
  console.log(`   Skipped : ${skipped} existing date slots`);
  console.log(`   Errors  : ${errors}`);
  console.log(`\nAll ${movies.length} movies now have shows across ${theatres.length} theatres for the next 7 days.`);
}

fixShows().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
