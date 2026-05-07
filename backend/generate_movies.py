import json, os, statistics

RAW = [
    # (title, year, rating, metascore, votes, duration_min, genres, type, imdb_id, episodes)
    # --- DRAMA ---
    ("The Shawshank Redemption",1994,9.3,80,2850000,142,["Drama"],"movie","tt0111161",0),
    ("12 Angry Men",1957,9.0,96,850000,96,["Crime","Drama"],"movie","tt0050083",0),
    ("Schindler's List",1993,9.0,94,1460000,195,["Biography","Drama","History"],"movie","tt0108052",0),
    ("Forrest Gump",1994,8.8,82,2200000,142,["Drama","Romance"],"movie","tt0109830",0),
    ("Goodfellas",1990,8.7,90,1250000,146,["Biography","Crime","Drama"],"movie","tt0099685",0),
    ("One Flew Over the Cuckoo's Nest",1975,8.7,84,1000000,133,["Drama"],"movie","tt0073486",0),
    ("Life Is Beautiful",1997,8.6,59,750000,116,["Comedy","Drama","Romance"],"movie","tt0118799",0),
    ("Saving Private Ryan",1998,8.6,91,1500000,169,["Drama","War"],"movie","tt0120815",0),
    ("American History X",1998,8.5,62,1150000,119,["Crime","Drama"],"movie","tt0120586",0),
    ("A Beautiful Mind",2001,8.2,72,950000,135,["Biography","Drama"],"movie","tt0268978",0),
    ("The Pursuit of Happyness",2006,8.0,64,1000000,117,["Biography","Drama"],"movie","tt0454921",0),
    ("Green Book",2018,8.2,69,750000,130,["Biography","Comedy","Drama"],"movie","tt6966692",0),
    ("Parasite",2019,8.5,96,850000,132,["Comedy","Drama","Thriller"],"movie","tt6751668",0),
    ("Joker",2019,8.4,59,1200000,122,["Crime","Drama","Thriller"],"movie","tt7286456",0),
    ("Marriage Story",2019,7.9,94,350000,137,["Comedy","Drama","Romance"],"movie","tt7653254",0),
    ("1917",2019,8.3,78,650000,119,["Drama","War"],"movie","tt8579674",0),
    ("Dunkirk",2017,7.8,94,700000,106,["Action","Drama","History"],"movie","tt5013056",0),
    ("Spotlight",2015,8.1,93,500000,128,["Biography","Crime","Drama"],"movie","tt1895587",0),
    ("Crash",2004,7.7,66,750000,113,["Crime","Drama","Thriller"],"movie","tt0375679",0),
    ("Oppenheimer",2023,8.9,88,700000,180,["Biography","Drama","History"],"movie","tt15398776",0),
    # --- CRIME / THRILLER ---
    ("The Godfather",1972,9.2,100,2000000,175,["Crime","Drama"],"movie","tt0068646",0),
    ("The Godfather Part II",1974,9.0,90,1350000,202,["Crime","Drama"],"movie","tt0071562",0),
    ("Pulp Fiction",1994,8.9,94,2200000,154,["Crime","Drama"],"movie","tt0110912",0),
    ("Fight Club",1999,8.8,66,2300000,139,["Drama"],"movie","tt0137523",0),
    ("Se7en",1995,8.6,65,1750000,127,["Crime","Drama","Mystery"],"movie","tt0114369",0),
    ("The Usual Suspects",1995,8.5,77,1150000,106,["Crime","Mystery","Thriller"],"movie","tt0114814",0),
    ("No Country for Old Men",2007,8.2,91,1150000,122,["Crime","Drama","Thriller"],"movie","tt0477348",0),
    ("Heat",1995,8.3,76,700000,170,["Action","Crime","Drama"],"movie","tt0113277",0),
    ("Prisoners",2013,8.1,74,900000,153,["Crime","Drama","Mystery"],"movie","tt1392214",0),
    ("Gone Girl",2014,8.1,79,950000,149,["Drama","Mystery","Thriller"],"movie","tt2267998",0),
    ("Zodiac",2007,7.7,78,420000,157,["Crime","Drama","Mystery"],"movie","tt0443706",0),
    ("Chinatown",1974,8.2,92,350000,130,["Drama","Mystery","Thriller"],"movie","tt0071315",0),
    ("The Departed",2006,8.5,85,1350000,151,["Crime","Drama","Thriller"],"movie","tt0407887",0),
    ("Oldboy",2003,8.4,77,550000,120,["Action","Drama","Mystery"],"movie","tt0364569",0),
    ("Memento",2000,8.4,80,1250000,113,["Mystery","Thriller"],"movie","tt0209144",0),
    ("Knives Out",2019,7.9,82,700000,130,["Comedy","Crime","Drama"],"movie","tt8946378",0),
    ("L.A. Confidential",1997,8.2,90,500000,138,["Crime","Drama","Mystery"],"movie","tt0119488",0),
    ("The Prestige",2006,8.5,66,1400000,130,["Drama","Mystery","Sci-Fi"],"movie","tt0482571",0),
    ("Fargo",1996,8.1,85,700000,98,["Crime","Drama","Thriller"],"movie","tt0116282",0),
    ("Nightcrawler",2014,7.9,76,600000,117,["Crime","Drama","Thriller"],"movie","tt2769594",0),
    # --- ACTION / ADVENTURE ---
    ("The Dark Knight",2008,9.0,84,2900000,152,["Action","Crime","Drama"],"movie","tt0468569",0),
    ("Inception",2010,8.8,74,2500000,148,["Action","Adventure","Sci-Fi"],"movie","tt1375666",0),
    ("The Matrix",1999,8.7,73,2100000,136,["Action","Sci-Fi"],"movie","tt0133093",0),
    ("The Lord of the Rings: The Fellowship of the Ring",2001,8.8,92,1900000,178,["Action","Adventure","Drama"],"movie","tt0120737",0),
    ("The Lord of the Rings: The Two Towers",2002,8.7,87,1700000,179,["Action","Adventure","Drama"],"movie","tt0167261",0),
    ("The Lord of the Rings: The Return of the King",2003,9.0,94,1950000,201,["Action","Adventure","Drama"],"movie","tt0167260",0),
    ("Star Wars: Episode IV - A New Hope",1977,8.6,90,1400000,121,["Action","Adventure","Fantasy"],"movie","tt0076759",0),
    ("Star Wars: Episode V - The Empire Strikes Back",1980,8.7,82,1300000,124,["Action","Adventure","Fantasy"],"movie","tt0080684",0),
    ("Gladiator",2000,8.5,67,1500000,155,["Action","Adventure","Drama"],"movie","tt0172495",0),
    ("Mad Max: Fury Road",2015,8.1,90,1000000,120,["Action","Adventure","Sci-Fi"],"movie","tt1392190",0),
    ("Die Hard",1988,8.2,72,900000,132,["Action","Thriller"],"movie","tt0095016",0),
    ("Terminator 2: Judgment Day",1991,8.6,75,1200000,137,["Action","Sci-Fi"],"movie","tt0103064",0),
    ("Raiders of the Lost Ark",1981,8.4,85,1000000,115,["Action","Adventure"],"movie","tt0082971",0),
    ("Top Gun: Maverick",2022,8.3,78,700000,130,["Action","Drama"],"movie","tt1745960",0),
    ("Mission: Impossible - Fallout",2018,7.7,86,500000,147,["Action","Adventure","Thriller"],"movie","tt4912910",0),
    ("John Wick",2014,7.4,68,700000,101,["Action","Crime","Thriller"],"movie","tt2911666",0),
    ("The Dark Knight Rises",2012,8.4,78,1700000,164,["Action","Drama"],"movie","tt1345836",0),
    ("Batman Begins",2005,8.2,70,1400000,140,["Action","Drama"],"movie","tt0372784",0),
    ("Casino Royale",2006,8.0,80,800000,144,["Action","Adventure","Thriller"],"movie","tt0381061",0),
    ("The Avengers",2012,8.0,69,1500000,143,["Action","Adventure","Sci-Fi"],"movie","tt0848228",0),
    ("Avengers: Endgame",2019,8.4,78,1200000,181,["Action","Adventure","Drama"],"movie","tt4154796",0),
    # --- SCI-FI ---
    ("Interstellar",2014,8.7,74,2200000,169,["Adventure","Drama","Sci-Fi"],"movie","tt0816692",0),
    ("2001: A Space Odyssey",1968,8.3,84,700000,149,["Adventure","Sci-Fi"],"movie","tt0062622",0),
    ("Blade Runner",1982,8.1,84,750000,117,["Sci-Fi","Thriller"],"movie","tt0083658",0),
    ("Blade Runner 2049",2017,8.0,81,600000,164,["Drama","Sci-Fi"],"movie","tt1856101",0),
    ("The Martian",2015,8.0,80,900000,144,["Adventure","Drama","Sci-Fi"],"movie","tt3659388",0),
    ("Gravity",2013,7.7,96,750000,91,["Drama","Sci-Fi","Thriller"],"movie","tt1454468",0),
    ("Arrival",2016,7.9,81,700000,116,["Drama","Mystery","Sci-Fi"],"movie","tt2543164",0),
    ("Ex Machina",2014,7.7,78,600000,108,["Drama","Sci-Fi","Thriller"],"movie","tt0470752",0),
    ("District 9",2009,7.9,81,700000,112,["Action","Sci-Fi","Thriller"],"movie","tt1136608",0),
    ("Her",2013,8.0,90,650000,126,["Drama","Romance","Sci-Fi"],"movie","tt1798709",0),
    ("The Terminator",1984,8.1,83,850000,107,["Action","Sci-Fi"],"movie","tt0088247",0),
    ("Avatar",2009,7.9,83,1300000,162,["Action","Adventure","Fantasy"],"movie","tt0499549",0),
    ("Dune",2021,8.0,74,700000,155,["Adventure","Drama","Sci-Fi"],"movie","tt1160419",0),
    ("Tenet",2020,7.4,69,600000,150,["Action","Sci-Fi","Thriller"],"movie","tt6723592",0),
    ("Edge of Tomorrow",2014,7.9,71,650000,113,["Action","Sci-Fi"],"movie","tt1631867",0),
    # --- ANIMATION ---
    ("Spirited Away",2001,8.6,96,750000,125,["Animation","Adventure","Family"],"movie","tt0245429",0),
    ("Princess Mononoke",1997,8.4,76,400000,134,["Animation","Adventure","Fantasy"],"movie","tt0119698",0),
    ("WALL-E",2008,8.4,95,1100000,98,["Animation","Adventure","Family"],"movie","tt0910970",0),
    ("Toy Story",1995,8.3,95,1000000,81,["Animation","Adventure","Comedy"],"movie","tt0114709",0),
    ("Toy Story 3",2010,8.3,92,850000,103,["Animation","Adventure","Comedy"],"movie","tt0435761",0),
    ("Up",2009,8.3,88,1000000,96,["Animation","Adventure","Comedy"],"movie","tt1049413",0),
    ("Finding Nemo",2003,8.2,89,1000000,100,["Animation","Adventure","Comedy"],"movie","tt0266543",0),
    ("The Lion King",1994,8.5,88,1100000,88,["Animation","Adventure","Drama"],"movie","tt0110357",0),
    ("Coco",2017,8.4,81,750000,105,["Animation","Adventure","Comedy"],"movie","tt2380307",0),
    ("Spider-Man: Into the Spider-Verse",2018,8.4,87,650000,117,["Animation","Action","Adventure"],"movie","tt4633694",0),
    ("Grave of the Fireflies",1988,8.5,94,300000,89,["Animation","Drama","War"],"movie","tt0095327",0),
    ("My Neighbor Totoro",1988,8.2,86,350000,86,["Animation","Family","Fantasy"],"movie","tt0096283",0),
    ("Howl's Moving Castle",2004,8.2,86,450000,119,["Animation","Adventure","Family"],"movie","tt0347149",0),
    ("Inside Out",2015,8.2,94,750000,95,["Animation","Adventure","Comedy"],"movie","tt2096673",0),
    ("Soul",2020,8.1,83,500000,100,["Animation","Adventure","Comedy"],"movie","tt2948372",0),
    # --- COMEDY ---
    ("Some Like It Hot",1959,8.2,98,300000,121,["Comedy","Romance"],"movie","tt0053291",0),
    ("Dr. Strangelove",1964,8.4,96,550000,95,["Comedy","War"],"movie","tt0057012",0),
    ("Monty Python and the Holy Grail",1975,8.2,91,600000,91,["Adventure","Comedy","Fantasy"],"movie","tt0071853",0),
    ("The Grand Budapest Hotel",2014,8.1,88,850000,99,["Adventure","Comedy","Crime"],"movie","tt2278388",0),
    ("Annie Hall",1977,8.0,97,280000,93,["Comedy","Drama","Romance"],"movie","tt0075686",0),
    ("Groundhog Day",1993,8.1,72,650000,101,["Comedy","Fantasy","Romance"],"movie","tt0107048",0),
    ("The Big Lebowski",1998,8.1,71,750000,117,["Comedy","Crime","Drama"],"movie","tt0118715",0),
    ("Superbad",2007,7.6,76,700000,113,["Comedy"],"movie","tt0829482",0),
    ("Blazing Saddles",1974,7.7,74,230000,93,["Comedy","Western"],"movie","tt0071230",0),
    ("Home Alone",1990,7.7,57,700000,103,["Comedy","Family"],"movie","tt0099785",0),
    ("The Truman Show",1998,8.2,90,1000000,103,["Comedy","Drama","Sci-Fi"],"movie","tt0120382",0),
    ("Ferris Bueller's Day Off",1986,7.8,61,400000,103,["Comedy","Drama"],"movie","tt0091042",0),
    ("The Nice Guys",2016,7.4,70,350000,116,["Action","Comedy","Crime"],"movie","tt3799694",0),
    ("Knives Out",2019,7.9,82,700000,130,["Comedy","Crime","Drama"],"movie","tt8946378",0),
    ("Glass Onion",2022,7.1,81,200000,139,["Comedy","Crime","Mystery"],"movie","tt11564570",0),
    # --- HORROR ---
    ("The Shining",1980,8.4,66,1100000,146,["Drama","Horror"],"movie","tt0081505",0),
    ("Psycho",1960,8.5,97,650000,109,["Horror","Mystery","Thriller"],"movie","tt0054215",0),
    ("Get Out",2017,7.7,84,700000,104,["Horror","Mystery","Thriller"],"movie","tt5052448",0),
    ("A Quiet Place",2018,7.5,82,550000,90,["Drama","Horror","Sci-Fi"],"movie","tt6644200",0),
    ("Hereditary",2018,7.3,87,350000,127,["Drama","Horror","Mystery"],"movie","tt7784604",0),
    ("The Exorcist",1973,8.1,81,400000,122,["Horror"],"movie","tt0070047",0),
    ("Alien",1979,8.5,89,850000,117,["Horror","Sci-Fi"],"movie","tt0078748",0),
    ("Halloween",1978,7.7,87,400000,91,["Horror","Thriller"],"movie","tt0077651",0),
    ("Midsommar",2019,7.1,72,250000,148,["Drama","Horror","Mystery"],"movie","tt8772262",0),
    ("The Conjuring",2013,7.5,68,500000,112,["Horror","Mystery","Thriller"],"movie","tt1457767",0),
    ("Pan's Labyrinth",2006,8.2,98,650000,118,["Drama","Fantasy","War"],"movie","tt0457430",0),
    ("Jaws",1975,8.1,87,650000,124,["Adventure","Horror","Thriller"],"movie","tt0073195",0),
    ("Rosemary's Baby",1968,8.0,96,290000,137,["Drama","Horror","Mystery"],"movie","tt0063522",0),
    ("It Follows",2014,6.8,83,250000,100,["Horror","Mystery","Thriller"],"movie","tt3235888",0),
    ("Annihilation",2018,6.8,79,350000,115,["Adventure","Drama","Horror"],"movie","tt2798920",0),
    # --- BIOGRAPHY ---
    ("Darkest Hour",2017,7.4,75,350000,125,["Biography","Drama","History"],"movie","tt4555426",0),
    ("The King's Speech",2010,8.0,88,750000,118,["Biography","Drama","History"],"movie","tt1504320",0),
    ("Bohemian Rhapsody",2018,7.9,49,650000,134,["Biography","Drama","Music"],"movie","tt1727824",0),
    ("Walk the Line",2005,7.9,72,280000,136,["Biography","Drama","Music"],"movie","tt0358273",0),
    ("Lincoln",2012,7.3,86,350000,150,["Biography","Drama","History"],"movie","tt0443272",0),
    ("Gandhi",1982,8.0,79,210000,191,["Biography","Drama","History"],"movie","tt0083987",0),
    ("The Social Network",2010,7.8,95,750000,120,["Biography","Drama"],"movie","tt1285016",0),
    ("Whiplash",2014,8.5,88,750000,107,["Drama","Music"],"movie","tt2582802",0),
    ("Amadeus",1984,8.3,88,400000,160,["Biography","Drama","Music"],"movie","tt0086879",0),
    ("Ray",2004,7.7,71,250000,152,["Biography","Drama","Music"],"movie","tt0350258",0),
    # --- ROMANCE ---
    ("Casablanca",1942,8.5,100,600000,102,["Drama","Romance","War"],"movie","tt0034583",0),
    ("Eternal Sunshine of the Spotless Mind",2004,8.3,89,1050000,108,["Drama","Romance","Sci-Fi"],"movie","tt0338013",0),
    ("La La Land",2016,8.0,93,750000,128,["Comedy","Drama","Music"],"movie","tt3783958",0),
    ("Titanic",1997,7.9,75,1200000,194,["Drama","Romance"],"movie","tt0120338",0),
    ("Before Sunrise",1995,8.1,80,300000,101,["Drama","Romance"],"movie","tt0112471",0),
    ("Lost in Translation",2003,7.7,89,400000,102,["Drama","Romance"],"movie","tt0335266",0),
    ("Amélie",2001,8.3,69,800000,122,["Comedy","Romance"],"movie","tt0211915",0),
    ("Moonlight",2016,7.4,99,350000,111,["Drama"],"movie","tt4975722",0),
    ("Call Me by Your Name",2017,7.9,93,280000,132,["Drama","Romance"],"movie","tt5726616",0),
    ("Portrait of a Lady on Fire",2019,8.1,95,120000,121,["Drama","Romance"],"movie","tt8613070",0),
    # --- WAR ---
    ("Apocalypse Now",1979,8.4,94,650000,147,["Drama","Mystery","War"],"movie","tt0078788",0),
    ("Full Metal Jacket",1987,8.3,76,650000,116,["Drama","War"],"movie","tt0093058",0),
    ("Das Boot",1981,8.3,86,350000,149,["Adventure","Drama","War"],"movie","tt0082096",0),
    ("Hacksaw Ridge",2016,8.1,71,700000,139,["Biography","Drama","History"],"movie","tt2119532",0),
    ("Come and See",1985,8.4,88,150000,142,["Drama","Thriller","War"],"movie","tt0091251",0),
    ("Patton",1970,8.0,85,210000,172,["Biography","Drama","History"],"movie","tt0066206",0),
    ("The Bridge on the River Kwai",1957,8.1,87,230000,161,["Adventure","Drama","War"],"movie","tt0050212",0),
    ("All Quiet on the Western Front",2022,7.8,79,200000,148,["Drama","War"],"movie","tt1016150",0),
    # --- WESTERN ---
    ("The Good, the Bad and the Ugly",1966,8.8,90,800000,178,["Western"],"movie","tt0060196",0),
    ("Once Upon a Time in the West",1968,8.5,80,350000,165,["Western"],"movie","tt0064116",0),
    ("True Grit",2010,7.6,80,450000,110,["Adventure","Drama","Western"],"movie","tt1403865",0),
    ("Django Unchained",2012,8.4,81,1500000,165,["Drama","Western"],"movie","tt1853728",0),
    ("The Hateful Eight",2015,7.8,73,700000,187,["Crime","Drama","Mystery"],"movie","tt3460252",0),
    # --- CLASSICS ---
    ("Citizen Kane",1941,7.9,100,530000,119,["Drama","Mystery"],"movie","tt0033467",0),
    ("Sunset Boulevard",1950,8.4,98,300000,110,["Drama","Film-Noir","Mystery"],"movie","tt0043014",0),
    ("Metropolis",1927,8.3,98,200000,153,["Drama","Sci-Fi"],"movie","tt0017136",0),
    ("Bicycle Thieves",1948,8.3,100,250000,89,["Drama"],"movie","tt0040522",0),
    ("Seven Samurai",1954,8.6,98,550000,207,["Action","Adventure","Drama"],"movie","tt0047478",0),
    ("Tokyo Story",1953,8.2,100,200000,136,["Drama"],"movie","tt0046438",0),
    ("Rashomon",1950,8.2,98,260000,88,["Crime","Drama","Mystery"],"movie","tt0042876",0),
    ("The Third Man",1949,8.1,100,220000,93,["Film-Noir","Mystery","Thriller"],"movie","tt0041959",0),
    ("Rear Window",1954,8.5,100,440000,112,["Mystery","Thriller"],"movie","tt0047396",0),
    ("Vertigo",1958,7.7,100,280000,128,["Mystery","Romance","Thriller"],"movie","tt0052357",0),
    ("North by Northwest",1959,8.3,98,280000,136,["Action","Adventure","Mystery"],"movie","tt0053125",0),
    ("Psycho",1960,8.5,97,650000,109,["Horror","Mystery","Thriller"],"movie","tt0054215",0),
    # --- MORE POPULAR ---
    ("The Silence of the Lambs",1991,8.6,85,1500000,118,["Crime","Drama","Thriller"],"movie","tt0102926",0),
    ("Interstellar",2014,8.7,74,2200000,169,["Adventure","Drama","Sci-Fi"],"movie","tt0816692",0),
    ("Back to the Future",1985,8.5,87,1200000,116,["Adventure","Comedy","Sci-Fi"],"movie","tt0088763",0),
    ("E.T. the Extra-Terrestrial",1982,7.9,97,550000,115,["Adventure","Family","Sci-Fi"],"movie","tt0083866",0),
    ("Jurassic Park",1993,8.2,68,1000000,127,["Action","Adventure","Sci-Fi"],"movie","tt0107290",0),
    ("The Shining",1980,8.4,66,1100000,146,["Drama","Horror"],"movie","tt0081505",0),
    ("Drive",2011,7.8,79,650000,100,["Crime","Drama","Thriller"],"movie","tt0780504",0),
    ("Birdman",2014,7.7,88,500000,119,["Comedy","Drama"],"movie","tt2562232",0),
    ("The Revenant",2015,8.0,76,850000,156,["Action","Adventure","Drama"],"movie","tt1663202",0),
    ("Room",2015,8.1,86,400000,118,["Drama","Thriller"],"movie","tt3170832",0),
    ("Hell or High Water",2016,7.6,88,350000,102,["Crime","Drama","Western"],"movie","tt4302938",0),
    ("Three Billboards Outside Ebbing, Missouri",2017,8.1,88,600000,115,["Crime","Drama"],"movie","tt5765446",0),
    ("The Favourite",2018,7.5,90,300000,119,["Biography","Comedy","Drama"],"movie","tt5765466",0),
    ("Roma",2018,7.7,96,250000,135,["Drama"],"movie","tt6155172",0),
    ("Nomadland",2020,7.3,93,200000,108,["Drama"],"movie","tt9770150",0),
    ("The Power of the Dog",2021,6.9,88,200000,126,["Drama","Western"],"movie","tt10293406",0),
    ("Everything Everywhere All at Once",2022,7.8,81,350000,139,["Action","Adventure","Comedy"],"movie","tt6710474",0),
    ("The Banshees of Inisherin",2022,7.7,94,150000,114,["Comedy","Drama"],"movie","tt11813216",0),
    ("Tár",2022,7.4,97,120000,158,["Drama","Music"],"movie","tt14444726",0),
    ("V for Vendetta",2005,8.2,62,1000000,132,["Action","Drama","Sci-Fi"],"movie","tt0434409",0),
    ("Mulholland Drive",2001,7.9,87,380000,147,["Drama","Mystery","Thriller"],"movie","tt0166924",0),
    ("Shutter Island",2010,8.2,63,1300000,138,["Mystery","Thriller"],"movie","tt1130884",0),
    ("The Sixth Sense",1999,8.2,64,1000000,107,["Drama","Mystery","Thriller"],"movie","tt0167404",0),
    ("The Princess Bride",1987,8.1,77,500000,98,["Adventure","Comedy","Fantasy"],"movie","tt0093779",0),
    ("Rocky",1976,8.1,70,600000,120,["Drama","Sport"],"movie","tt0075148",0),
    ("Raging Bull",1980,8.2,99,320000,129,["Biography","Drama","Sport"],"movie","tt0081398",0),
    ("Moneyball",2011,7.6,87,500000,133,["Biography","Drama","Sport"],"movie","tt1210166",0),
    ("Ford v Ferrari",2019,8.1,81,600000,152,["Action","Biography","Drama"],"movie","tt1950186",0),
    ("La Dolce Vita",1960,8.0,99,160000,174,["Comedy","Drama","Romance"],"movie","tt0053779",0),
    ("8½",1963,8.0,100,200000,138,["Comedy","Drama"],"movie","tt0056801",0),
    # --- TV SHOWS ---
    ("Breaking Bad",2008,9.5,73,2300000,49,["Crime","Drama","Thriller"],"tv","tt0903747",62),
    ("Game of Thrones",2011,9.2,71,2300000,57,["Action","Adventure","Drama"],"tv","tt0944947",73),
    ("The Wire",2002,9.3,78,390000,59,["Crime","Drama","Thriller"],"tv","tt0306414",60),
    ("The Sopranos",1999,9.2,85,400000,55,["Crime","Drama"],"tv","tt0141842",86),
    ("Chernobyl",2019,9.4,97,700000,65,["Drama","History","Thriller"],"tv","tt7366338",5),
    ("Band of Brothers",2001,9.4,97,550000,60,["Action","Drama","History"],"tv","tt0185906",10),
    ("True Detective",2014,9.0,95,480000,55,["Crime","Drama","Mystery"],"tv","tt2356777",8),
    ("Sherlock",2010,9.1,78,600000,88,["Crime","Drama","Mystery"],"tv","tt1475582",15),
    ("The Crown",2016,8.7,84,300000,58,["Biography","Drama","History"],"tv","tt4786824",60),
    ("Peaky Blinders",2013,8.8,68,500000,60,["Crime","Drama"],"tv","tt2442560",36),
    ("Mindhunter",2017,8.6,90,350000,55,["Crime","Drama","Thriller"],"tv","tt5290382",19),
    ("Fleabag",2016,8.7,96,200000,27,["Comedy","Drama"],"tv","tt5687612",12),
    ("Dark",2017,8.8,87,250000,60,["Crime","Drama","Mystery"],"tv","tt5753856",26),
    ("Succession",2018,8.9,95,350000,60,["Drama"],"tv","tt7660850",39),
    ("Ozark",2017,8.4,81,350000,60,["Crime","Drama","Thriller"],"tv","tt5071412",44),
    ("Stranger Things",2016,8.7,78,1200000,51,["Drama","Fantasy","Horror"],"tv","tt4574334",34),
    ("Better Call Saul",2015,8.9,82,500000,47,["Crime","Drama"],"tv","tt3032476",63),
    ("The Boys",2019,8.7,79,650000,60,["Action","Comedy","Crime"],"tv","tt1190634",32),
    ("Black Mirror",2011,8.8,83,300000,60,["Drama","Sci-Fi","Thriller"],"tv","tt2085059",22),
    ("Narcos",2015,8.8,74,450000,49,["Biography","Crime","Drama"],"tv","tt2707408",30),
    ("Westworld",2016,8.6,74,450000,62,["Drama","Mystery","Sci-Fi"],"tv","tt0475784",36),
    ("The Mandalorian",2019,8.7,89,450000,40,["Action","Adventure","Fantasy"],"tv","tt8111088",24),
    ("Squid Game",2021,8.0,69,650000,50,["Action","Drama","Mystery"],"tv","tt10919420",9),
    ("Money Heist",2017,8.3,52,600000,70,["Action","Crime","Mystery"],"tv","tt6468322",41),
    ("Fargo",2014,9.0,96,300000,53,["Crime","Drama","Thriller"],"tv","tt2802850",53),
    ("Twin Peaks",1990,8.8,96,160000,47,["Crime","Drama","Mystery"],"tv","tt0098936",30),
    ("The Handmaid's Tale",2017,8.4,92,260000,57,["Drama","Sci-Fi","Thriller"],"tv","tt5834204",60),
    ("Boardwalk Empire",2010,8.6,84,200000,57,["Crime","Drama"],"tv","tt0979432",56),
    ("Silicon Valley",2014,8.5,77,220000,28,["Comedy"],"tv","tt2575988",53),
    ("The Office",2005,9.0,77,750000,22,["Comedy"],"tv","tt0386676",201),
    ("The Americans",2013,8.5,82,150000,45,["Crime","Drama","Thriller"],"tv","tt2149175",75),
    ("Atlanta",2016,8.6,86,120000,38,["Comedy","Drama"],"tv","tt4779116",35),
    ("Euphoria",2019,8.4,72,350000,58,["Drama"],"tv","tt8772296",16),
    ("Severance",2022,8.7,83,200000,50,["Drama","Mystery","Sci-Fi"],"tv","tt11280740",18),
    ("White Lotus",2021,7.9,90,120000,44,["Comedy","Drama"],"tv","tt13406094",13),
    ("Abbott Elementary",2021,8.3,90,60000,22,["Comedy"],"tv","tt13301248",31),
    ("The Leftovers",2014,8.3,78,100000,60,["Drama","Fantasy","Mystery"],"tv","tt2699720",28),
]

def compute_iqr_bounds(values):
    if len(values) < 4:
        return None, None
    s = sorted(values)
    n = len(s)
    q1 = statistics.median(s[:n//2])
    q3 = statistics.median(s[n//2:] if n % 2 == 0 else s[n//2+1:])
    iqr = q3 - q1
    return q1 - 1.5 * iqr, q3 + 1.5 * iqr

seen = set()
movies = []
for row in RAW:
    title = row[0]
    if title in seen:
        continue
    seen.add(title)
    t, year, rating, meta, votes, dur, genres, typ, imdb_id, eps = row
    movies.append({
        "title": t, "year": year, "rating": rating, "metascore": meta,
        "votes": votes, "duration_min": dur, "genres": genres, "type": typ,
        "url": f"https://www.imdb.com/title/{imdb_id}/",
        "imdb_url": f"https://www.imdb.com/title/{imdb_id}/",
        **({"episodes": eps} if eps else {}),
    })

movie_durs = [m["duration_min"] for m in movies if m["type"] == "movie"]
low, high = compute_iqr_bounds(movie_durs)

ratings = [m["rating"] for m in movies]
rlow, rhigh = compute_iqr_bounds(ratings)

for m in movies:
    dur_out = False
    if m["type"] == "movie" and low is not None:
        dur_out = m["duration_min"] < low or m["duration_min"] > high
    hi_rat_lo_meta = m["rating"] >= 8.5 and m["metascore"] < 70
    rat_votes_inc = m["rating"] >= 8.7 and m["votes"] < 300000
    m["is_anomaly"] = dur_out or hi_rat_lo_meta or rat_votes_inc
    m["anomaly_rating_high_meta_low"] = hi_rat_lo_meta
    m["anomaly_duration_outlier"] = dur_out
    m["anomaly_rating_votes_inconsistent"] = rat_votes_inc

out = {"records": movies}
path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "movies_final.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)

print(f"Generated {len(movies)} unique records -> movies_final.json")
anomalies = sum(1 for m in movies if m["is_anomaly"])
print(f"Anomalies: {anomalies} ({anomalies/len(movies)*100:.1f}%)")
movies_count = sum(1 for m in movies if m["type"] == "movie")
tv_count = sum(1 for m in movies if m["type"] == "tv")
print(f"Movies: {movies_count}, TV: {tv_count}")
