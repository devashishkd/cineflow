/**
 * Script to add latest and upcoming movies of different genres
 * via user: user@gmail.com / 123456
 */

const BASE_URL = 'http://localhost:3000/api';

const moviesToSeed = [
  // ─── LATEST / NOW SHOWING (28 movies) ──────────────────────────────────────
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-03-01',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler',
    director: 'Denis Villeneuve',
    producer: 'Mary Parent, Cale Boyter, Denis Villeneuve',
    duration: 166,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: 8.6,
  },
  {
    title: 'Deadpool & Wolverine',
    description: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-07-26',
    cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Matthew Macfadyen',
    director: 'Shawn Levy',
    producer: 'Kevin Feige, Ryan Reynolds, Shawn Levy',
    duration: 128,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    rating: 7.9,
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: 'Drama',
    language: 'English',
    releaseDate: '2023-07-21',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh',
    director: 'Christopher Nolan',
    producer: 'Emma Thomas, Charles Roven, Christopher Nolan',
    duration: 180,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: 8.9,
  },
  {
    title: 'Stree 2: Sarkate Ka Aatank',
    description: 'After the events of Stree, the town of Chanderi is haunted again by a headless demonic entity named Sarkata abducting progressive women.',
    genre: 'Comedy',
    language: 'Hindi',
    releaseDate: '2024-08-15',
    cast: 'Rajkummar Rao, Shraddha Kapoor, Pankaj Tripathi, Abhishek Banerjee, Aparshakti Khurana',
    director: 'Amar Kaushik',
    producer: 'Dinesh Vijan, Jyoti Deshpande',
    duration: 147,
    posterUrl: 'https://image.tmdb.org/t/p/w500/m2zT3b42T2xXQ06Zq2K93n2tU8K.jpg',
    rating: 7.7,
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of the revered hero Maximus, Lucius must enter the Colosseum after his home is conquered by imperial emperors.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-11-22',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen, Joseph Quinn',
    director: 'Ridley Scott',
    producer: 'Ridley Scott, Michael Pruss, Lucy Fisher',
    duration: 148,
    posterUrl: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    rating: 7.5,
  },
  {
    title: 'Inside Out 2',
    description: 'Joy, Sadness, Anger, Fear and Disgust find themselves joined by new emotions including Anxiety, Envy, Ennui, and Embarrassment.',
    genre: 'Animation',
    language: 'English',
    releaseDate: '2024-06-14',
    cast: 'Amy Poehler, Maya Hawke, Kensington Tallman, Liza Lapira, Tony Hale',
    director: 'Kelsey Mann',
    producer: 'Mark Nielsen',
    duration: 96,
    posterUrl: 'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    rating: 7.7,
  },
  {
    title: 'Alien: Romulus',
    description: 'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    genre: 'Horror',
    language: 'English',
    releaseDate: '2024-08-16',
    cast: 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced',
    director: 'Fede Álvarez',
    producer: 'Ridley Scott, Michael Pruss, Walter Hill',
    duration: 119,
    posterUrl: 'https://image.tmdb.org/t/p/w500/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    rating: 7.3,
  },
  {
    title: 'Fighter',
    description: 'An elite Air Force unit, the Air Dragons, assemble to handle militant threats and execute dangerous aerial dogfights in the skies.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2024-01-25',
    cast: 'Hrithik Roshan, Deepika Padukone, Anil Kapoor, Karan Singh Grover',
    director: 'Siddharth Anand',
    producer: 'Viacom18 Studios, Marflix Pictures',
    duration: 166,
    posterUrl: 'https://image.tmdb.org/t/p/w500/zDZowR2z2Z1yWz4Y1s4u9C9kUqM.jpg',
    rating: 7.1,
  },
  {
    title: 'The Substance',
    description: 'A fading celebrity uses a black-market drug, a cell-replicating substance that temporarily creates a younger, better version of herself.',
    genre: 'Horror',
    language: 'English',
    releaseDate: '2024-09-20',
    cast: 'Demi Moore, Margaret Qualley, Dennis Quaid, Hugo Diego Garcia',
    director: 'Coralie Fargeat',
    producer: 'Coralie Fargeat, Eric Fellner, Tim Bevan',
    duration: 141,
    posterUrl: 'https://image.tmdb.org/t/p/w500/lqoMzCcZYEFK729Fc6rKWZ51nLi.jpg',
    rating: 7.6,
  },
  {
    title: 'Kill',
    description: 'When a passenger train to New Delhi is overtaken by dozens of armed bandits, commando Amrit wages a bloody war across every compartment.',
    genre: 'Thriller',
    language: 'Hindi',
    releaseDate: '2024-07-05',
    cast: 'Lakshya, Raghav Juyal, Tanya Maniktala, Abhishek Chauhan',
    director: 'Nikhil Nagesh Bhat',
    producer: 'Karan Johar, Guneet Monga, Apoorva Mehta',
    duration: 105,
    posterUrl: 'https://image.tmdb.org/t/p/w500/m2zT3b42T2xXQ06Zq2K93n2tU8K.jpg',
    rating: 7.8,
  },
  {
    title: 'John Wick: Chapter 4',
    description: 'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2023-03-24',
    cast: 'Keanu Reeves, Donnie Yen, Bill Skarsgård, Laurence Fishburne, Hiroyuki Sanada',
    director: 'Chad Stahelski',
    producer: 'Basil Iwanyk, Erica Lee, Chad Stahelski',
    duration: 169,
    posterUrl: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    rating: 7.9,
  },
  {
    title: 'Kingdom of the Planet of the Apes',
    description: 'Several generations in the future following Caesar\'s reign, apes are now the dominant species living harmoniously while a tyrannical ape leader builds his empire.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-05-10',
    cast: 'Owen Teague, Freya Allan, Kevin Durand, Peter Macon',
    director: 'Wes Ball',
    producer: 'Joe Hartwick Jr., Rick Jaffa, Amanda Silver, Jason Reed',
    duration: 145,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    rating: 7.1,
  },
  {
    title: '12th Fail',
    description: 'Based on the true story of IPS officer Manoj Kumar Sharma, who restarted his academic journey after failing 12th grade to achieve his dreams.',
    genre: 'Drama',
    language: 'Hindi',
    releaseDate: '2023-10-27',
    cast: 'Vikrant Massey, Medha Shankar, Anant V Joshi, Anshumaan Pushkar',
    director: 'Vidhu Vinod Chopra',
    producer: 'Vidhu Vinod Chopra, Yogesh Ishwar',
    duration: 147,
    posterUrl: 'https://image.tmdb.org/t/p/w500/4fbbQ75rQ30tL07E2F8q1f6X8Jp.jpg',
    rating: 9.1,
  },
  {
    title: 'Kalki 2898 AD',
    description: 'In a post-apocalyptic future city of Kasi, a modern-day avatar of Vishnu descends to protect humanity from the villainous Supreme Yaskin.',
    genre: 'Sci-Fi',
    language: 'Telugu',
    releaseDate: '2024-06-27',
    cast: 'Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone, Disha Patani',
    director: 'Nag Ashwin',
    producer: 'C. Aswani Dutt',
    duration: 181,
    posterUrl: 'https://image.tmdb.org/t/p/w500/3U0Ld4Z3XkF8bF3VbE6U2k3Q4.jpg',
    rating: 7.6,
  },
  {
    title: 'Anyone But You',
    description: 'After an amazing first date, Bea and Ben\'s fiery attraction turns ice cold until they unexpectedly find themselves reunited at a destination wedding in Australia.',
    genre: 'Romance',
    language: 'English',
    releaseDate: '2023-12-22',
    cast: 'Sydney Sweeney, Glen Powell, Alexandra Shipp, GaTa, Dermot Mulroney',
    director: 'Will Gluck',
    producer: 'Will Gluck, Joe Roth, Jeff Kirschenbaum',
    duration: 103,
    posterUrl: 'https://image.tmdb.org/t/p/w500/5qHoazZAFvXd0m07utbhKuvl6r1.jpg',
    rating: 7.0,
  },
  {
    title: 'Civil War',
    description: 'A journey across a dystopian future America, following a team of military-embedded journalists as they race against time to reach DC before rebel factions descend.',
    genre: 'Thriller',
    language: 'English',
    releaseDate: '2024-04-12',
    cast: 'Kirsten Dunst, Wagner Moura, Cailee Spaeny, Stephen McKinley Henderson',
    director: 'Alex Garland',
    producer: 'Andrew Macdonald, Allon Reich, Gregory Goodman',
    duration: 109,
    posterUrl: 'https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg',
    rating: 7.2,
  },
  {
    title: 'Chandu Champion',
    description: 'The triumphant life story of Murlikant Petkar, India\'s first Paralympic gold medalist who overcame bullet wounds and coma to make history.',
    genre: 'Drama',
    language: 'Hindi',
    releaseDate: '2024-06-14',
    cast: 'Kartik Aaryan, Vijay Raaz, Bhuvan Arora, Yashpal Sharma',
    director: 'Kabir Khan',
    producer: 'Sajid Nadiadwala, Kabir Khan',
    duration: 143,
    posterUrl: 'https://image.tmdb.org/t/p/w500/e9N0C5Zf2Y4K8X3v2J0K5Z3v4Y.jpg',
    rating: 8.2,
  },
  {
    title: 'A Quiet Place: Day One',
    description: 'A young woman named Sam must navigate the terrifying first moments of an alien invasion in the world\'s loudest city: New York City.',
    genre: 'Horror',
    language: 'English',
    releaseDate: '2024-06-28',
    cast: 'Lupita Nyong\'o, Joseph Quinn, Alex Wolff, Djimon Hounsou',
    director: 'Michael Sarnoski',
    producer: 'Michael Bay, Andrew Form, Brad Fuller, John Krasinski',
    duration: 99,
    posterUrl: 'https://image.tmdb.org/t/p/w500/yrpPYK2qm9rl59FDnkZp2sHn7qR.jpg',
    rating: 6.9,
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'Po must train a new warrior when he\'s chosen to become the spiritual leader of the Valley of Peace, facing a shapeshifting sorceress along the way.',
    genre: 'Animation',
    language: 'English',
    releaseDate: '2024-03-08',
    cast: 'Jack Black, Awkwafina, Viola Davis, Dustin Hoffman, Bryan Cranston',
    director: 'Mike Mitchell',
    producer: 'Rebecca Huntley',
    duration: 94,
    posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    rating: 7.2,
  },
  {
    title: 'Shaitaan',
    description: 'A family\'s peaceful weekend retreat becomes a nightmare when an uninvited stranger takes hypnotic control over their teenage daughter.',
    genre: 'Thriller',
    language: 'Hindi',
    releaseDate: '2024-03-08',
    cast: 'Ajay Devgn, R. Madhavan, Jyothika, Janki Bodiwala',
    director: 'Vikas Bahl',
    producer: 'Ajay Devgn, Jyoti Deshpande, Kumar Mangat Pathak',
    duration: 132,
    posterUrl: 'https://image.tmdb.org/t/p/w500/xW3s8K1s8d9F2s3d4s5.jpg',
    rating: 7.5,
  },
  {
    title: 'Despicable Me 4',
    description: 'Gru and Lucy and their girls welcome a new member to the family, Gru Jr., who is intent on tormenting his dad, as an escaped nemesis plots revenge.',
    genre: 'Animation',
    language: 'English',
    releaseDate: '2024-07-03',
    cast: 'Steve Carell, Kristen Wiig, Will Ferrell, Joey King, Sofia Vergara',
    director: 'Chris Renaud',
    producer: 'Chris Meledandri, Brett Hoffman',
    duration: 95,
    posterUrl: 'https://image.tmdb.org/t/p/w500/wWba3TaojhK7NdycRhoQpsG0FaH.jpg',
    rating: 7.3,
  },
  {
    title: 'Animal',
    description: 'The complex dynamics between an emotionally volatile son and his emotionally distant industrialist father, sparking a brutal underworld conflict.',
    genre: 'Crime',
    language: 'Hindi',
    releaseDate: '2023-12-01',
    cast: 'Ranbir Kapoor, Anil Kapoor, Bobby Deol, Rashmika Mandanna, Triptii Dimri',
    director: 'Sandeep Reddy Vanga',
    producer: 'Bhushan Kumar, Krishan Kumar, Murad Khetani',
    duration: 201,
    posterUrl: 'https://image.tmdb.org/t/p/w500/hr9rjhcS4V5vJvW7x5hJtN2.jpg',
    rating: 7.0,
  },
  {
    title: 'Bad Boys: Ride or Die',
    description: 'Miami\'s favorite cops are back with an iconic mix of edge-of-your-seat action and outrageous comedy, but this time they are on the run.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-06-07',
    cast: 'Will Smith, Martin Lawrence, Vanessa Hudgens, Alexander Ludwig',
    director: 'Adil El Arbi, Bilall Fallah',
    producer: 'Jerry Bruckheimer, Will Smith, Chad Oman',
    duration: 115,
    posterUrl: 'https://image.tmdb.org/t/p/w500/oGythE98MYleE6mZlGs5oBGkux1.jpg',
    rating: 7.1,
  },
  {
    title: 'Madgaon Express',
    description: 'Three childhood friends embark on a long-dreamt trip to Goa that goes hilariously wrong as they get embroiled in drug cartels and police chases.',
    genre: 'Comedy',
    language: 'Hindi',
    releaseDate: '2024-03-22',
    cast: 'Divyenndu, Pratik Gandhi, Avinash Tiwary, Nora Fatehi',
    director: 'Kunal Kemmu',
    producer: 'Farhan Akhtar, Ritesh Sidhwani',
    duration: 143,
    posterUrl: 'https://image.tmdb.org/t/p/w500/z0T0S7D9a0X2b3C4.jpg',
    rating: 7.6,
  },
  {
    title: 'Twisters',
    description: 'Haunted by a devastating encounter with a tornado, Kate Cooper is lured back to the open plains by her friend Javi to test a groundbreaking new tracking system.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-07-19',
    cast: 'Daisy Edgar-Jones, Glen Powell, Anthony Ramos, Brandon Perea, Maura Tierney',
    director: 'Lee Isaac Chung',
    producer: 'Frank Marshall, Patrick Crowley',
    duration: 122,
    posterUrl: 'https://image.tmdb.org/t/p/w500/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg',
    rating: 7.2,
  },
  {
    title: 'Jawan',
    description: 'A driven man sets out on a personal vendetta to rectify the wrongs in society, while confronting a monstrous outlaw who has caused suffering to many.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2023-09-07',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone',
    director: 'Atlee',
    producer: 'Gauri Khan',
    duration: 169,
    posterUrl: 'https://image.tmdb.org/t/p/w500/h57362y4r7tq8u9.jpg',
    rating: 7.6,
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island\'s mysteries.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-03-29',
    cast: 'Rebecca Hall, Brian Tyree Henry, Dan Stevens, Kaylee Hottle',
    director: 'Adam Wingard',
    producer: 'Thomas Tull, Jon Jashni, Mary Parent',
    duration: 115,
    posterUrl: 'https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg',
    rating: 7.2,
  },
  {
    title: 'Chhaava',
    description: 'The epic historical chronicle of the legendary Maratha king Chhatrapati Sambhaji Maharaj and his fearless stand defending his kingdom.',
    genre: 'Drama',
    language: 'Hindi',
    releaseDate: '2024-12-06',
    cast: 'Vicky Kaushal, Rashmika Mandanna, Akshaye Khanna, Ashutosh Rana',
    director: 'Laxman Utekar',
    producer: 'Dinesh Vijan',
    duration: 160,
    posterUrl: 'https://image.tmdb.org/t/p/w500/k2zT4b51T1xXQ06Zq2K93n2tU8K.jpg',
    rating: 8.5,
  },

  // ─── UPCOMING MOVIES (8 movies, future release dates) ──────────────────────
  {
    title: 'Avatar: Fire and Ash',
    description: 'The third chapter of James Cameron\'s Avatar franchise, introducing the aggressive Ash People clan of Na\'vi on Pandora.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2026-12-18',
    cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver, Michelle Yeoh, Stephen Lang',
    director: 'James Cameron',
    producer: 'James Cameron, Jon Landau',
    duration: 190,
    posterUrl: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    rating: 0,
  },
  {
    title: 'Avengers: Doomsday',
    description: 'The Avengers reunite against their greatest cosmic threat yet as Victor von Doom rises to reshape reality itself.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2027-05-01',
    cast: 'Robert Downey Jr., Pedro Pascal, Benedict Cumberbatch, Anthony Mackie',
    director: 'Anthony Russo, Joe Russo',
    producer: 'Kevin Feige',
    duration: 165,
    posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: 0,
  },
  {
    title: 'The Batman: Part II',
    description: 'The Dark Knight continues his crusade against corruption and psychotic criminal masterminds deeply rooted in Gotham City\'s underworld.',
    genre: 'Crime',
    language: 'English',
    releaseDate: '2027-10-01',
    cast: 'Robert Pattinson, Colin Farrell, Andy Serkis, Jeffrey Wright',
    director: 'Matt Reeves',
    producer: 'Matt Reeves, Dylan Clark',
    duration: 175,
    posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    rating: 0,
  },
  {
    title: 'Mission: Impossible - The Final Reckoning',
    description: 'Ethan Hunt and the IMF team undertake their most dangerous mission yet, racing to neutralize a rogue AI threatening global peace.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2026-11-20',
    cast: 'Tom Cruise, Hayley Atwell, Ving Rhames, Simon Pegg, Esai Morales',
    director: 'Christopher McQuarrie',
    producer: 'Tom Cruise, Christopher McQuarrie',
    duration: 160,
    posterUrl: 'https://image.tmdb.org/t/p/w500/NNxYkU70HPurnNCSiCjYAmacwm.jpg',
    rating: 0,
  },
  {
    title: 'War 2',
    description: 'Major Kabir Dhaliwal crosses paths with a lethal new adversary in an international espionage war with high-octane spectacle.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2026-10-02',
    cast: 'Hrithik Roshan, N.T. Rama Rao Jr., Kiara Advani, John Abraham',
    director: 'Ayan Mukerji',
    producer: 'Aditya Chopra',
    duration: 155,
    posterUrl: 'https://image.tmdb.org/t/p/w500/zDZowR2z2Z1yWz4Y1s4u9C9kUqM.jpg',
    rating: 0,
  },
  {
    title: 'Toxic: A Fairy Tale for Grown-ups',
    description: 'A dark, stylish crime thriller set against the backdrop of international cartels and underworld empires.',
    genre: 'Drama',
    language: 'Kannada',
    releaseDate: '2026-11-05',
    cast: 'Yash, Nayanthara, Huma Qureshi, Shruti Haasan',
    director: 'Geetu Mohandas',
    producer: 'Venkat K. Narayana, Yash',
    duration: 165,
    posterUrl: 'https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
    rating: 0,
  },
  {
    title: 'Spider-Man 4',
    description: 'Peter Parker navigates life as a grounded hero in New York City while facing unexpected street-level and multiversal threats.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2027-07-24',
    cast: 'Tom Holland, Zendaya, Jacob Batalon',
    director: 'Destin Daniel Cretton',
    producer: 'Kevin Feige, Amy Pascal',
    duration: 145,
    posterUrl: 'https://image.tmdb.org/t/p/w500/TRBNPetHukrorY8xN9XZtnwS7oR5mv0xOYi.jpg',
    rating: 0,
  },
  {
    title: 'Krrish 4',
    description: 'Krishna Mehra must harness newfound cosmic abilities when an intergalactic force threatens the survival of planet Earth.',
    genre: 'Sci-Fi',
    language: 'Hindi',
    releaseDate: '2027-12-25',
    cast: 'Hrithik Roshan, Priyanka Chopra, Preity Zinta, Nawazuddin Siddiqui',
    director: 'Rakesh Roshan',
    producer: 'Rakesh Roshan',
    duration: 155,
    posterUrl: 'https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',
    rating: 0,
  }
];

async function seed() {
  console.log('--- Step 1: Authenticating as user@gmail.com ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@gmail.com', password: '123456' }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.data?.token) {
    throw new Error(`Login failed: ${loginData.message || loginRes.statusText}`);
  }

  const token = loginData.data.token;
  console.log(`Authenticated successfully! User role: ${loginData.data.user.role}`);

  console.log('\n--- Step 2: Fetching Existing Movies & Theatres ---');
  const existingMoviesRes = await fetch(`${BASE_URL}/movies?limit=100`);
  const existingMoviesData = await existingMoviesRes.json();
  const existingTitles = new Set((existingMoviesData.data || []).map(m => m.title.trim().toLowerCase()));

  const theatresRes = await fetch(`${BASE_URL}/theatres`);
  const theatresData = await theatresRes.json();
  const theatres = theatresData.data || [];
  console.log(`Found ${theatres.length} theatres in DB: ${theatres.map(t => `${t.name} (${t.city})`).join(', ')}`);

  console.log(`\n--- Step 3: Adding ${moviesToSeed.length} Movies via Authenticated API ---`);
  let addedCount = 0;
  let skippedCount = 0;
  const createdMovies = [];

  for (const movie of moviesToSeed) {
    if (existingTitles.has(movie.title.trim().toLowerCase())) {
      console.log(`[SKIPPED] "${movie.title}" already exists in database.`);
      skippedCount++;
      // Still fetch its record to schedule shows if needed
      const found = existingMoviesData.data.find(m => m.title.trim().toLowerCase() === movie.title.trim().toLowerCase());
      if (found) createdMovies.push(found);
      continue;
    }

    const createRes = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(movie),
    });

    const createData = await createRes.json();
    if (createRes.ok && createData.data) {
      console.log(`[ADDED] "${movie.title}" (${movie.genre} | ${movie.language} | Release: ${movie.releaseDate})`);
      addedCount++;
      createdMovies.push(createData.data);
    } else {
      console.error(`[ERROR] Failed to add "${movie.title}":`, createData.message);
    }
  }

  console.log(`\nSummary: Added ${addedCount} new movies, ${skippedCount} previously existed.`);

  // Step 4: Schedule shows for now_showing movies
  console.log('\n--- Step 4: Scheduling Shows for Now Showing Movies ---');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
  const showTimes = ['10:30:00', '14:15:00', '18:00:00', '21:30:00'];
  const prices = [250, 320, 400, 350];

  let showsCreated = 0;
  for (const movie of createdMovies) {
    // Only schedule shows for movies currently released (now_showing)
    if (movie.releaseDate > today) continue;

    for (const theatre of theatres) {
      // Check if shows already exist for this movie & theatre
      const checkRes = await fetch(`${BASE_URL}/shows/movie/${movie.id}?theatreId=${theatre.id}`);
      const checkData = await checkRes.json();
      if (checkData.data && checkData.data.length > 0) {
        continue;
      }

      // Create a couple shows across today and tomorrow
      for (let i = 0; i < 2; i++) {
        const date = i === 0 ? today : tomorrow;
        const time = showTimes[(movie.title.length + i) % showTimes.length];
        const price = prices[i % prices.length];

        const showRes = await fetch(`${BASE_URL}/shows`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            movieId: movie.id,
            theatreId: theatre.id,
            showDate: date,
            showTime: time,
            price: price,
            totalSeats: 100,
          }),
        });

        if (showRes.ok) {
          showsCreated++;
        }
      }
    }
  }

  console.log(`Created ${showsCreated} new shows across theatres in ${theatres.map(t => t.city).join(', ')}.`);
  console.log('\nAll done successfully!');
}

seed().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
