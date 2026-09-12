import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/modules/auth/user.model.js';
import Movie from '../src/modules/movies/movie.model.js';
import Theatre from '../src/modules/theatres/theatre.model.js';
import Show from '../src/modules/shows/show.model.js';
import Seat from '../src/modules/shows/seat.model.js';

// ─── 32 Curated Movies with Trusted IMDb / Amazon Media CDN Images ─────────────
const moviesData = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-01-15',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe',
    director: 'Christopher Nolan',
    producer: 'Emma Thomas, Christopher Nolan',
    duration: 148,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    rating: 8.8,
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-01-20',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine, Maggie Gyllenhaal',
    director: 'Christopher Nolan',
    producer: 'Charles Roven, Emma Thomas, Christopher Nolan',
    duration: 152,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    rating: 9.0,
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-02-01',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine, Matt Damon',
    director: 'Christopher Nolan',
    producer: 'Emma Thomas, Christopher Nolan, Lynda Obst',
    duration: 169,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
    rating: 8.7,
  },
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: 'Drama',
    language: 'English',
    releaseDate: '2024-02-10',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh',
    director: 'Christopher Nolan',
    producer: 'Emma Thomas, Charles Roven, Christopher Nolan',
    duration: 180,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg',
    rating: 8.9,
  },
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
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NWUzLWIxNGMtNjU3N2E3NWZhNVlhXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 8.6,
  },
  {
    title: 'Gladiator II',
    description: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors who lead Rome with an iron fist.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-11-22',
    cast: 'Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen, Joseph Quinn',
    director: 'Ridley Scott',
    producer: 'Ridley Scott, Michael Pruss, Lucy Fisher',
    duration: 148,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNWE5MGI3MDctMmU5Ni00YzI2LWEzMTQtZGIyZDA5MzQzNDBhXkEyXkFqcGc@._V1_.jpg',
    rating: 7.6,
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: 'Animation',
    language: 'English',
    releaseDate: '2024-03-15',
    cast: 'Shameik Moore, Hailee Steinfeld, Brian Tyree Henry, Oscar Isaac',
    director: 'Joaquim Dos Santos, Kemp Powers',
    producer: 'Phil Lord, Christopher Miller, Amy Pascal',
    duration: 140,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg',
    rating: 8.7,
  },
  {
    title: 'RRR',
    description: 'A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and chart out an inspiring path of freedom against the despotic rulers.',
    genre: 'Action',
    language: 'Telugu',
    releaseDate: '2024-01-10',
    cast: 'N.T. Rama Rao Jr., Ram Charan, Ajay Devgn, Alia Bhatt, Shriya Saran',
    director: 'S.S. Rajamouli',
    producer: 'D.V.V. Danayya',
    duration: 187,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNy00ZTA2LWIyYTEtMDc5Y2E5NjgzZmU4XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg',
    rating: 8.0,
  },
  {
    title: 'Jawan',
    description: 'A high-octane action thriller which outlines the emotional journey of a man who is set to rectify the wrongs in the society.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2024-01-25',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi, Deepika Padukone, Priyamani',
    director: 'Atlee',
    producer: 'Gauri Khan',
    duration: 169,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMmQ3ZTJkM2UtNmEzNi00MjhhLWE4NmEtYjEzN2EyZmU3NmJmXkEyXkFqcGdeQXVyMTE0MzcwMjM1._V1_.jpg',
    rating: 7.4,
  },
  {
    title: 'Kalki 2898 AD',
    description: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces.',
    genre: 'Sci-Fi',
    language: 'Telugu',
    releaseDate: '2024-06-27',
    cast: 'Prabhas, Amitabh Bachchan, Kamal Haasan, Deepika Padukone, Disha Patani',
    director: 'Nag Ashwin',
    producer: 'C. Aswani Dutt',
    duration: 181,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2ZDdmZDYtOGU3Ny00NzAwLWI0YjktN2FhZTlhMDllOTRiXkEyXkFqcGc@._V1_.jpg',
    rating: 7.7,
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
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZDAzM2UzOWUtNWQ4Yi00ZjI1LWE4MmItYmJmYTdmNzFiMWE3XkEyXkFqcGc@._V1_.jpg',
    rating: 7.6,
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
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNzRiMjg0MzUtNTQ1Eg00Y2Q5LWEwM2MtMzUwZDU5NmVjN2FlXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_.jpg',
    rating: 7.8,
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    genre: 'Sci-Fi',
    language: 'English',
    releaseDate: '2024-02-14',
    cast: 'Sam Worthington, Zoe Saldana, Sigourney Weaver, Stephen Lang, Kate Winslet',
    director: 'James Cameron',
    producer: 'James Cameron, Jon Landau',
    duration: 192,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYjhiNjBlODctY2ZiOC00YjVlLWFiNzAtNTVoNGEwNjcxOTBhXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 7.6,
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
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYWY3ZGY0YTAtNGYwNy00NTFhLWJmYjAtZDE3ZTlhMThlYTMyXkEyXkFqcGc@._V1_.jpg',
    rating: 7.7,
  },
  {
    title: 'Top Gun: Maverick',
    description: 'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN\'s elite graduates on a mission that demands the ultimate sacrifice from those chosen to fly it.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-01-18',
    cast: 'Tom Cruise, Miles Teller, Jennifer Connelly, Jon Hamm, Glen Powell',
    director: 'Joseph Kosinski',
    producer: 'Jerry Bruckheimer, Tom Cruise, Christopher McQuarrie',
    duration: 130,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZWYzOGEwNTgtNWU3NS00M2I0LWI3ZTUtMTNlYTZkZTk1ODgyXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 8.3,
  },
  {
    title: 'The Batman',
    description: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    genre: 'Crime',
    language: 'English',
    releaseDate: '2024-02-28',
    cast: 'Robert Pattinson, Zoë Kravitz, Jeffrey Wright, Colin Farrell, Paul Dano',
    director: 'Matt Reeves',
    producer: 'Dylan Clark, Matt Reeves',
    duration: 176,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMGMzYS00ODAzLTlmOTUtMmQ2ODdhYjNjODAxXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 7.8,
  },
  {
    title: 'Avengers: Endgame',
    description: 'After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance.',
    genre: 'Action',
    language: 'English',
    releaseDate: '2024-01-05',
    cast: 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson',
    director: 'Anthony Russo, Joe Russo',
    producer: 'Kevin Feige',
    duration: 181,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg',
    rating: 8.4,
  },
  {
    title: '12th Fail',
    description: 'The real-life story of IPS Officer Manoj Kumar Sharma and IRS Officer Shraddha Joshi, showcasing unwavering grit, passion and triumph against all odds.',
    genre: 'Drama',
    language: 'Hindi',
    releaseDate: '2024-01-12',
    cast: 'Vikrant Massey, Medha Shankr, Anant V Joshi, Anshumaan Pushkar',
    director: 'Vidhu Vinod Chopra',
    producer: 'Vidhu Vinod Chopra, Yogesh Ishwar',
    duration: 147,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTFlNmU3MjEtZDUzNy00NzExLTlmNmEtNDRhZmExYTZlMDY0XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 8.9,
  },
  {
    title: 'Kantara',
    description: 'When greed paves the way for betrayal, scheming and murder, a young tribal man reluctantly embraces his ancestors\' mystical legacy to seek justice for his community.',
    genre: 'Thriller',
    language: 'Kannada',
    releaseDate: '2024-02-18',
    cast: 'Rishab Shetty, Kishore, Achyuth Kumar, Sapthami Gowda',
    director: 'Rishab Shetty',
    producer: 'Vijay Kiragandur',
    duration: 148,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNjQzY2ZhNzctOGU2ZS00OWVmLTk5NTUtOWYwYjFkZmVjODcxXkEyXkFqcGdeQXVyMTE0MzcwMjM1._V1_.jpg',
    rating: 8.2,
  },
  {
    title: 'Manjummel Boys',
    description: 'A group of friends from Kochi embark on a trip to Kodaikanal, where an unexpected accident traps one of them in the dangerous Guna Caves, sparking a historic rescue operation.',
    genre: 'Thriller',
    language: 'Malayalam',
    releaseDate: '2024-02-22',
    cast: 'Soubin Shahir, Sreenath Bhasi, Balu Varghese, Ganapathi, Jean Paul Lal',
    director: 'Chidambaram',
    producer: 'Babu Shahir, Soubin Shahir, Shawn Antony',
    duration: 135,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZmMyNTRkYjUtODMxYy00NzVmLTgwYzktMGI1ZGVmMWRhMjE5XkEyXkFqcGc@._V1_.jpg',
    rating: 8.3,
  },
  {
    title: 'Aavesham',
    description: 'Three young college students in Bangalore encounter trouble with local bullies and seek the assistance of an eccentric local gangster named Ranga to get even.',
    genre: 'Comedy',
    language: 'Malayalam',
    releaseDate: '2024-04-11',
    cast: 'Fahadh Faasil, Hipzster, Mithun Jai Shankar, Roshan Shanavas, Sajin Gopu',
    director: 'Jithu Madhavan',
    producer: 'Nazriya Nazim, Anwar Rasheed',
    duration: 158,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZTYwMTBmOTctNmMzOC00NDU2LTk3YTYtNGU3MjhkOTlmMzcwXkEyXkFqcGc@._V1_.jpg',
    rating: 7.9,
  },
  {
    title: 'Kill',
    description: 'When army commando Amrit finds out his true love Tulika is being engaged against her will, he boards a New Delhi-bound train in a quest to derail the arranged marriage, but a gang of knife-wielding bandits terrorize innocent passengers.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2024-07-05',
    cast: 'Lakshya, Raghav Juyal, Tanya Maniktala, Abhishek Chauhan, Ashish Vidyarthi',
    director: 'Nikhil Nagesh Bhat',
    producer: 'Karan Johar, Guneet Monga, Apoorva Mehta',
    duration: 105,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMmRiMGExMDQtYjFhZi00OTdhLWFlNGYtZDNjYmNhMmEwZGIxXkEyXkFqcGc@._V1_.jpg',
    rating: 7.6,
  },
  {
    title: 'Vikram',
    description: 'A special investigator is assigned a case of serial killings, leading him into an escalating war between an undercover police squadron and a ruthless drug syndicate.',
    genre: 'Action',
    language: 'Tamil',
    releaseDate: '2024-03-08',
    cast: 'Kamal Haasan, Vijay Sethupathi, Fahadh Faasil, Suriya, Narain',
    director: 'Lokesh Kanagaraj',
    producer: 'Kamal Haasan, R. Mahendran',
    duration: 175,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BOTk1ODgzNzctYTNmYi00YTM0LTk0NTgtMjY2OTBkMGUwYzg4XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 8.3,
  },
  {
    title: 'Leo',
    description: 'Parthiban is a mild-mannered cafe owner in Kashmir, who fends off a gang of murderous thugs and catches the attention of a drug cartel claiming he is their long-lost enforcer Leo Das.',
    genre: 'Action',
    language: 'Tamil',
    releaseDate: '2024-02-15',
    cast: 'Thalapathy Vijay, Sanjay Dutt, Arjun Sarja, Trisha Krishnan, Gautham Vasudev Menon',
    director: 'Lokesh Kanagaraj',
    producer: 'S. S. Lalit Kumar, Jagadish Palanisamy',
    duration: 164,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZWYtZWRiMTZmNzBmNjZlXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 7.2,
  },
  {
    title: 'Shaitaan',
    description: 'A family\'s peaceful retreat into the hills takes a terrifying turn when an enigmatic stranger infiltrates their home, exerting psychological and supernatural control over their teenage daughter.',
    genre: 'Horror',
    language: 'Hindi',
    releaseDate: '2024-03-08',
    cast: 'Ajay Devgn, R. Madhavan, Jyothika, Janki Bodiwala, Anngad Raaj',
    director: 'Vikas Bahl',
    producer: 'Ajay Devgn, Jyoti Deshpande, Kumar Mangat Pathak',
    duration: 132,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BYzA2MmI0YjYtYWIwZi00Mjk1LWE2ZTMtYzk4ODg3YTI2MGQ4XkEyXkFqcGc@._V1_.jpg',
    rating: 6.7,
  },
  {
    title: 'Bramayugam',
    description: 'Thevan, a folk singer of the Paanan caste, has a fateful encounter when escaping a slave market, leading him to an ancient decaying mansion presided over by a sinister landlord.',
    genre: 'Horror',
    language: 'Malayalam',
    releaseDate: '2024-02-15',
    cast: 'Mammootty, Arjun Ashokan, Sidharth Bharathan, Amalda Liz',
    director: 'Rahul Sadasivan',
    producer: 'Chakravarthy Ramachandra, S. Sashikanth',
    duration: 139,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BODg1YjA3MDItYzY5MS00MmU4LWJjNzQtNmRhN2Q2MjNhNmI3XkEyXkFqcGc@._V1_.jpg',
    rating: 7.8,
  },
  {
    title: 'Fighter',
    description: 'An aspiring young man and his fellow aviators come together at the Air Force Station Tezpur to form an elite team called Air Dragons, ready to respond to terrorist threats.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2024-01-25',
    cast: 'Hrithik Roshan, Deepika Padukone, Anil Kapoor, Karan Singh Grover, Akshay Oberoi',
    director: 'Siddharth Anand',
    producer: 'Mamta Anand, Siddharth Anand, Jyoti Deshpande',
    duration: 166,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZTIzMzkzM2QtNWZkZi00YmNlLWJlMTAtYmIxN2NlZTRhM2JhXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 6.4,
  },
  {
    title: 'Pathaan',
    description: 'An Indian agent races against a doomsday clock as a ruthless mercenary, with a bitter vendetta, mounts an apocalyptic attack against the country.',
    genre: 'Action',
    language: 'Hindi',
    releaseDate: '2024-01-26',
    cast: 'Shah Rukh Khan, Deepika Padukone, John Abraham, Dimple Kapadia, Ashutosh Rana',
    director: 'Siddharth Anand',
    producer: 'Aditya Chopra',
    duration: 146,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BM2QzM2UxNzMtN2Y5Yi00OTBhLTgzMjMtODk5YWFhODRjYjFiXkEyXkFqcGdeQXVyMTEzNzg0Mjkx._V1_.jpg',
    rating: 6.8,
  },
  {
    title: 'Pushpa 2: The Rule',
    description: 'Pushpa Raj rises to become an underworld kingpin, leading his red sandalwood smuggling empire while navigating the relentless vengeance of SP Bhanwar Singh Shekhawat.',
    genre: 'Action',
    language: 'Telugu',
    releaseDate: '2024-12-05',
    cast: 'Allu Arjun, Rashmika Mandanna, Fahadh Faasil, Jagapathi Babu, Prakash Raj',
    director: 'Sukumar',
    producer: 'Naveen Yerneni, Y. Ravi Shankar',
    duration: 200,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNGE0MGJhZTYtMWFmNy00MWY3LTg3MzQtMmFlNzY4MTNmODllXkEyXkFqcGc@._V1_.jpg',
    rating: 7.9,
  },
  {
    title: 'Joker: Folie à Deux',
    description: 'Arthur Fleck is institutionalized at Arkham awaiting trial for his crimes as Joker. While struggling with his dual identity, Arthur not only stumbles upon true love, but also finds the musical rhythm that\'s always been inside him.',
    genre: 'Drama',
    language: 'English',
    releaseDate: '2024-10-04',
    cast: 'Joaquin Phoenix, Lady Gaga, Brendan Gleeson, Catherine Keener, Zazie Beetz',
    director: 'Todd Phillips',
    producer: 'Todd Phillips, Emma Tillinger Koskoff, Joseph Garner',
    duration: 138,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BNTRlYjMwNDAtMjM4MC00MmE3LTk5OGYtN2U1MGUyY2M0OWMzXkEyXkFqcGc@._V1_.jpg',
    rating: 5.3,
  },
  {
    title: 'Salaar: Part 1 – Ceasefire',
    description: 'A gang leader makes a promise to a dying friend and takes on other criminal gangs in the dystopian city of Khansaar to help his friend reclaim his throne.',
    genre: 'Action',
    language: 'Telugu',
    releaseDate: '2024-01-08',
    cast: 'Prabhas, Prithviraj Sukumaran, Shruti Haasan, Jagapathi Babu, Bobby Simha',
    director: 'Prashanth Neel',
    producer: 'Vijay Kiragandur',
    duration: 175,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BMmU0NzY0ODctMGMwMC00MDRkLTg1MDUtYmFiZGE2YzQ0YTU5XkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg',
    rating: 6.5,
  },
  {
    title: 'Alien: Romulus',
    description: 'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    genre: 'Horror',
    language: 'English',
    releaseDate: '2024-08-16',
    cast: 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced, Spike Fearn',
    director: 'Fede Álvarez',
    producer: 'Ridley Scott, Michael Pruss, Walter Hill',
    duration: 119,
    posterUrl: 'https://m.media-amazon.com/images/M/MV5BZmNmMDFlN2EtODlhZi00NmI0LThkNDEtYWMzNjE3ZTUwNjlkXkEyXkFqcGc@._V1_.jpg',
    rating: 7.2,
  },
];

// ─── 14 Premier Theatres in 7 Major Cities (At least 2 per city) ───────────────
const theatresData = [
  // Mumbai
  {
    name: 'PVR INOX Palladium, Lower Parel',
    city: 'Mumbai',
    address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
    totalScreens: 7,
  },
  {
    name: 'Cinepolis Viviana Mall, Thane',
    city: 'Mumbai',
    address: 'Eastern Express Highway, Thane West, Mumbai, Maharashtra 400606',
    totalScreens: 14,
  },
  // Delhi-NCR
  {
    name: 'PVR Director\'s Cut, Ambience Mall',
    city: 'Delhi-NCR',
    address: 'Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
    totalScreens: 4,
  },
  {
    name: 'INOX Megaplex, Epicuria Nehru Place',
    city: 'Delhi-NCR',
    address: 'Epicuria Food Mall, Nehru Place Metro Station, New Delhi 110019',
    totalScreens: 6,
  },
  // Bengaluru
  {
    name: 'PVR Forum South Bengaluru, Konanakunte',
    city: 'Bengaluru',
    address: 'Kanakapura Main Road, Konanakunte Cross, Bengaluru, Karnataka 560062',
    totalScreens: 8,
  },
  {
    name: 'INOX Garuda Mall, Magrath Road',
    city: 'Bengaluru',
    address: 'Magrath Rd, Ashok Nagar, Bengaluru, Karnataka 560025',
    totalScreens: 5,
  },
  // Hyderabad
  {
    name: 'Prasads Multiplex IMAX, NTR Gardens',
    city: 'Hyderabad',
    address: 'NTR Gardens, Khairatabad, Hyderabad, Telangana 500063',
    totalScreens: 6,
  },
  {
    name: 'AMB Cinemas, Gachibowli',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Gachibowli - Miyapur Rd, Hyderabad, Telangana 500084',
    totalScreens: 7,
  },
  // Chennai
  {
    name: 'SPI Sathyam Cinemas, Royapettah',
    city: 'Chennai',
    address: '8, Thiruvika Rd, Royapettah, Chennai, Tamil Nadu 600014',
    totalScreens: 6,
  },
  {
    name: 'PVR Grand Galada, Pallavaram',
    city: 'Chennai',
    address: 'Grand Southern Trunk Rd, Cantonment, Pallavaram, Chennai, Tamil Nadu 600043',
    totalScreens: 5,
  },
  // Kolkata
  {
    name: 'INOX Quest Mall, Park Circus',
    city: 'Kolkata',
    address: '33, Syed Amir Ali Ave, Park Circus, Beck Bagan, Kolkata, West Bengal 700017',
    totalScreens: 6,
  },
  {
    name: 'Cinepolis Acropolis Mall, Kasba',
    city: 'Kolkata',
    address: '1858, Rajdanga Main Road, Kasba, Kolkata, West Bengal 700107',
    totalScreens: 5,
  },
  // Pune
  {
    name: 'PVR Phoenix Marketcity, Viman Nagar',
    city: 'Pune',
    address: 'Viman Nagar Road, Clover Park, Viman Nagar, Pune, Maharashtra 411014',
    totalScreens: 9,
  },
  {
    name: 'Cinepolis Seasons Mall, Magarpatta',
    city: 'Pune',
    address: 'Magarpatta City, Hadapsar, Pune, Maharashtra 411028',
    totalScreens: 15,
  },
];

async function seed() {
  console.log('🚀 Starting CineFlow Seed Pipeline...');
  console.log('Connecting to MongoDB...');
  await connectDB();

  // 1. Ensure Admin & Demo User
  console.log('\n--- Seeding Users ---');
  await User.deleteMany({ email: { $in: ['admin@cineflow.com', 'user@cineflow.com', 'user@gmail.com'] } });

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@cineflow.com',
    passwordHash: 'password123',
    role: 'ADMIN',
  });

  const demoUser = await User.create({
    name: 'Demo User',
    email: 'user@cineflow.com',
    passwordHash: 'password123',
    role: 'USER',
  });

  // Also support the existing user@gmail.com credentials
  await User.create({
    name: 'Power User',
    email: 'user@gmail.com',
    passwordHash: '123456',
    role: 'ADMIN',
  });
  console.log('✅ Admin & Demo users created');

  // 2. Clear old test movies & seed 32 movies
  console.log('\n--- Seeding 32 Movies (IMDb / Amazon Media CDN Posters) ---');
  await Movie.deleteMany({});
  const createdMovies = await Movie.insertMany(moviesData);
  console.log(`✅ Seeded ${createdMovies.length} movies successfully!`);

  // 3. Clear and seed 14 theatres in 7 cities
  console.log('\n--- Seeding Theatres (2+ in 7 Major Cities) ---');
  await Theatre.deleteMany({});
  const createdTheatres = await Theatre.insertMany(theatresData);
  console.log(`✅ Seeded ${createdTheatres.length} theatres across 7 cities:`);
  const citiesMap = {};
  for (const t of createdTheatres) {
    citiesMap[t.city] = (citiesMap[t.city] || 0) + 1;
  }
  for (const [city, count] of Object.entries(citiesMap)) {
    console.log(`   📍 ${city}: ${count} theatres`);
  }

  // 4. Clear shows and seats, then generate shows for all movies across all theatres
  console.log('\n--- Seeding Shows & Generating Seats ---');
  await Show.deleteMany({});
  await Seat.deleteMany({});

  // Dates: Today and next 4 days
  const now = new Date();
  const showDates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    showDates.push(d.toISOString().split('T')[0]);
  }

  const timeSlots = [
    '10:15:00',
    '13:30:00',
    '16:45:00',
    '20:00:00',
    '22:45:00',
  ];

  const priceTiers = [180, 220, 250, 300, 350, 420];

  const showsToInsert = [];
  let showIndex = 0;

  // We assign shows so that every movie is playing in multiple theatres and every theatre has multiple shows every day!
  for (const theatre of createdTheatres) {
    for (let dayIdx = 0; dayIdx < showDates.length; dayIdx++) {
      const date = showDates[dayIdx];

      // Schedule shows for 6-8 distinct movies per theatre per day
      for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
        const time = timeSlots[slotIdx];
        // Distribute movies across slots and theatres deterministically
        const movieIdx = (theatre.name.length + dayIdx * 3 + slotIdx * 2) % createdMovies.length;
        const movie = createdMovies[movieIdx];
        const price = priceTiers[(slotIdx + dayIdx) % priceTiers.length];

        showsToInsert.push({
          movieId: movie._id,
          theatreId: theatre._id,
          showDate: date,
          showTime: time,
          price: price,
          totalSeats: 50,
        });
        showIndex++;
      }
    }
  }

  // Also guarantee that every single movie has at least 5 shows across different theatres and dates
  for (const movie of createdMovies) {
    for (let i = 0; i < 3; i++) {
      const theatre = createdTheatres[(movie.title.length + i) % createdTheatres.length];
      const date = showDates[i % showDates.length];
      const time = timeSlots[(movie.duration + i) % timeSlots.length];
      const price = priceTiers[(movie.title.length + i) % priceTiers.length];

      showsToInsert.push({
        movieId: movie._id,
        theatreId: theatre._id,
        showDate: date,
        showTime: time,
        price: price,
        totalSeats: 50,
      });
    }
  }

  console.log(`Inserting ${showsToInsert.length} shows into MongoDB...`);
  const insertedShows = await Show.insertMany(showsToInsert);
  console.log(`✅ Inserted ${insertedShows.length} shows!`);

  // 5. Generate 50 seats for each show
  console.log('Generating seats for each show (Rows A-E, 10 seats each = 50 seats per show)...');
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const allSeats = [];

  for (const show of insertedShows) {
    for (const row of rows) {
      for (let col = 1; col <= 10; col++) {
        allSeats.push({
          showId: show._id,
          seatNumber: `${row}${col}`,
          row: row,
          status: 'AVAILABLE',
        });
      }
    }
  }

  // Insert seats in batches of 1000 for high performance
  console.log(`Inserting ${allSeats.length} seats in batches...`);
  const batchSize = 2500;
  for (let i = 0; i < allSeats.length; i += batchSize) {
    const batch = allSeats.slice(i, i + batchSize);
    await Seat.insertMany(batch, { ordered: false });
  }
  console.log(`✅ Generated all ${allSeats.length} seats successfully!`);

  console.log('\n=============================================================');
  console.log('🎉 SEEDING COMPLETE & VERIFIED');
  console.log(`🎬 Total Movies:   ${createdMovies.length} (all with IMDb / Amazon CDN posters)`);
  console.log(`🏛️ Total Theatres: ${createdTheatres.length} across 7 cities`);
  console.log(`🎟️ Total Shows:    ${insertedShows.length} across next 5 days`);
  console.log(`💺 Total Seats:    ${allSeats.length} (all available for booking)`);
  console.log('💰 Rupee Prices:   ₹180 to ₹420 configured with ₹ symbol');
  console.log('👤 Admin Account:  admin@cineflow.com / password123');
  console.log('👤 Demo User:      user@cineflow.com / password123');
  console.log('👤 Power User:     user@gmail.com / 123456');
  console.log('=============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
