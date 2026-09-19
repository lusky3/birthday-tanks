// Patch level names in levels.js to match the correct biographical data
import { readFileSync, writeFileSync } from 'fs';
import { LEVELS } from './src/data/levels.js';

// Correct level names keyed by year
// Sources: user-provided biographical data + the detailed world/level list
const NAMES = {
  // World 1: The Early Years (1956–1965)
  1956: "Allan is Born! 🎂",
  1957: "First Steps & Toddler Adventures",
  1958: "Trike Racer in Training",
  1959: "Classic 50s Rock 'n' Roll",
  1960: "Starting Elementary School",
  1961: "First Bicycle Speedster",
  1962: "60s Radio Classics",
  1963: "Neighbourhood Street Hockey",
  1964: "Gilligan's Island Premieres!",
  1965: "King City Youth Days",

  // World 2: The Growing Up Years (1966–1975)
  1966: "Star Trek: TOS Premieres!",
  1967: "Canada Centennial & Expo 67",
  1968: "Classic Rock & Big Dreams",
  1969: "Apollo 11: One Giant Leap!",
  1970: "King City Secondary School Begins!",
  1971: "High School Garage Mechanics",
  1972: "Summit Series: Team Canada! 🏒",
  1973: "Tuning Up First Engines",
  1974: "King City Secondary Graduation!",
  1975: "Classic Motoring & The Open Road",

  // World 3: The Adventure Years (1976–1985)
  1976: "Joining CN Rail & George Brown Millwright Program!",
  1977: "Star Wars Hits Theaters! ⭐",
  1978: "Mastering the Millwright Craft",
  1979: "George Brown Graduation & Amy Born (May 14)! ❤️",
  1980: "Miracle on Ice & Cottage Weekends",
  1981: "Jennifer Born (June 27)! ❤️",
  1982: "Rail Yard Heavy Machinery",
  1983: "The A-Team Premieres!",
  1984: "80s Rock & Long Highway Drives",
  1985: "Cottage Campfires & Lake Cruising",

  // World 4: The Family Years (1986–1995)
  1986: "Meeting Carrie Orr",
  1987: "Oct 24: Married Carrie Orr ❤️",
  1988: "Amy's Early Steps & Family Joy",
  1989: "Cody Born (May 6)! 🎉",
  1990: "Rising Up the Ranks at CN Rail",
  1991: "Kelsey Born (April 23)! ❤️",
  1992: "Four Wonderful Kids at Home",
  1993: "Backyard Rinks & Hockey Drills",
  1994: "Summer Lake Days at the Cottage",
  1995: "Family Road Trips Across Ontario",

  // World 5: The Cottage Years (1996–2005)
  1996: "Promoted to System Manager, Intermodal (CN Rail)! 🚂",
  1997: "Building the Cottage Dock & Boating",
  1998: "Intermodal Logistics Across North America",
  1999: "Surviving Y2K Prep & Century Turn",
  2000: "Millennium Family Celebrations",
  2001: "Classic Rock Radio & Workshop Projects",
  2002: "26+ Years of Dedicated Service at CN Rail",
  2003: "Joining Reefer Sales & NCIS Premieres!",
  2004: "Starry Nights by the Lake",
  2005: "Half a Century of Legendary Adventures 🏆",

  // World 6: The Open Road (2006–2015)
  2006: "Motorcycle Cruising & The Open Highway 🏍️",
  2007: "Keeping Reefer Fleet Rolling",
  2008: "Sunday TV Marathons & Big Family Dinners",
  2009: "Garage Workshop Master Handyman",
  2010: "Team Canada Winter Olympics Hockey Gold! 🥇",
  2011: "Joining TTX Company (Asst Manager NE USA & Canada)!",
  2012: "Railcar Pooling Logistics Leadership",
  2013: "Proud Dad & Growing Family Milestones",
  2014: "Highway Adventures with Carrie",
  2015: "Promoted to TTX Regional Manager (Burlington, ON)! 🎯",

  // World 7: The Legend Years (2016–2026)
  2016: "The 60 Milestone: Still Riding Strong 🏍️",
  2017: "TTX Regional Fleet Excellence",
  2018: "Cottage Sunsets & Family Gatherings",
  2019: "Well-Earned Retirement from TTX! 🎉",
  2020: "Relaxing at Home & Keeping Family Close",
  2021: "Workshop Time & Morning Coffees",
  2022: "Celebrating Life, Family & Good Times",
  2023: "Cruising into Prime Retirement",
  2024: "Counting Down to the Big Milestone",
  2025: "Almost 70... Here It Comes!",
  2026: "Happy 70th Birthday, Allan! The Big 70! 🎂🎉",
};

// Read the raw file
const raw = readFileSync('./src/data/levels.js', 'utf8');

// For each level, replace its name field
let patched = raw;
LEVELS.forEach((level) => {
  const correctName = NAMES[level.year];
  if (!correctName) {
    console.warn(`No name mapping for year ${level.year}`);
    return;
  }
  if (level.name === correctName) return; // already correct

  // Escape special regex chars in old name
  const escapedOld = level.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Replace "name": "OLD" with "name": "NEW" — be specific to avoid false matches
  const pattern = new RegExp(`("name":\\s*")${escapedOld}(")`);
  if (!pattern.test(patched)) {
    console.warn(`Could not find name for year ${level.year}: "${level.name}"`);
    return;
  }
  patched = patched.replace(pattern, `$1${correctName}$2`);
  console.log(`✓ ${level.year}: "${level.name}" → "${correctName}"`);
});

writeFileSync('./src/data/levels.js', patched, 'utf8');
console.log('\nDone. Verifying...');

// Verify
const { LEVELS: updated } = await import('./src/data/levels.js?v=' + Date.now());
updated.forEach((l) => {
  const expected = NAMES[l.year];
  if (expected && l.name !== expected) {
    console.error(`MISMATCH year ${l.year}: got "${l.name}", expected "${expected}"`);
  }
});
console.log('Verification complete. Level count:', updated.length);
