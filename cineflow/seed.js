const baseUrl = 'http://localhost:3000/api'; // Going through API Gateway

async function seed() {
  console.log('🎬 Seeding Theatres...');
  const t1 = await fetch(`${baseUrl}/movies/theatres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'AMC Times Square', city: 'New York', address: '123 Broadway' })
  }).then(r => r.json());
  
  const t2 = await fetch(`${baseUrl}/movies/theatres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Regal L.A. LIVE', city: 'Los Angeles', address: '1000 W Olympic Blvd' })
  }).then(r => r.json());

  console.log('🍿 Seeding Movies...');
  const m1 = await fetch(`${baseUrl}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Deadpool & Wolverine', genre: 'Action', duration: 127, language: 'English' })
  }).then(r => r.json());

  const m2 = await fetch(`${baseUrl}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Inside Out 2', genre: 'Animation', duration: 96, language: 'English' })
  }).then(r => r.json());

  const m3 = await fetch(`${baseUrl}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Dune: Part Two', genre: 'Sci-Fi', duration: 166, language: 'English' })
  }).then(r => r.json());

  console.log('📅 Seeding Shows...');
  const shows = [
    // AMC Times Square Shows
    { movieId: m1.data.id, theatreId: t1.data.id, showDate: '2024-08-15', showTime: '18:00:00', price: 15.00 },
    { movieId: m1.data.id, theatreId: t1.data.id, showDate: '2024-08-15', showTime: '21:00:00', price: 18.00 },
    { movieId: m2.data.id, theatreId: t1.data.id, showDate: '2024-08-15', showTime: '15:00:00', price: 12.00 },
    // Regal L.A. LIVE Shows
    { movieId: m3.data.id, theatreId: t2.data.id, showDate: '2024-08-16', showTime: '19:30:00', price: 20.00 },
    { movieId: m1.data.id, theatreId: t2.data.id, showDate: '2024-08-16', showTime: '22:00:00', price: 18.00 }
  ];

  for (const show of shows) {
    const s = await fetch(`${baseUrl}/shows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(show)
    }).then(r => r.json());
    console.log(`✅ Created Show for Movie ${show.movieId} at Theatre ${show.theatreId}`);
  }

  console.log('🎉 Seeding complete! Database is populated.');
}

seed().catch(console.error);
