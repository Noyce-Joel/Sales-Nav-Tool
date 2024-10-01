// src/tests/profileFiltering.test.ts

import levenshtein from "fast-levenshtein";

// Updated normalizeName function to avoid the /u flag
function normalizeName(name: string): string {
  // Regex patterns
  const diacriticsPattern = /[\u0300-\u036f]/g;
  const punctuationPattern = /[,!@#$%^&*()_+|~=`{}\[\]:";'<>?.\/\\-]/g;
  const titlesPattern = /\b(PhD|MD|MBA|Esq|Jr|Sr|II|III|IV)\b/gi;
  const emojiPattern = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g; // Matches surrogate pairs (emojis)

  return name
    .normalize("NFD") // Decompose combined letters into base letters and diacritical marks
    .replace(diacriticsPattern, "") // Remove diacritical marks
    .replace(punctuationPattern, "") // Remove punctuation and hyphens
    .replace(titlesPattern, "") // Remove common titles and suffixes
    .replace(emojiPattern, "") // Remove emojis
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .trim() // Remove leading and trailing whitespace
    .toLowerCase(); // Convert to lowercase for case-insensitive comparison
}

describe("Profile Name Filtering with Levenshtein Distance", () => {
  const existingConnections = new Set([
    "Amir Sani",
    "Sergey Polzunov 🇺🇦",
    "Georgina Allender-Manners 🔜 BLE",
  ]);

  const allProfiles = [
    "Amir Sani", // Should be excluded
    "Sergey Polzunov", // Should be excluded
    "Georgina Allender-Manners", // Should be excluded
    "Christopher Grittner", // Should be included
    "Michael Johnson", // Should be included
  ];

  const maxDistance = 5; // Adjust this value based on your testing

  it("should correctly filter profiles based on name similarity", () => {
    const profilesToScrape = allProfiles.filter((profileName) => {
      if (!profileName) return false;

      const normalizedProfile = normalizeName(profileName);

      const similarProfile = Array.from(existingConnections).find(
        (existingProfileName) => {
          const normalizedExistingProfile = normalizeName(existingProfileName);
          const distance = levenshtein.get(
            normalizedProfile,
            normalizedExistingProfile
          );
          console.log(
            `Comparing "${normalizedProfile}" with "${normalizedExistingProfile}": Levenshtein distance is ${distance}`
          );
          return distance <= maxDistance;
        }
      );

      console.log(!similarProfile);
      // Exclude if a similar profile is found
      return !similarProfile;
    });

    // Only "Alice Cooper" and "Michael Johnson" should be included
    expect(profilesToScrape).toEqual(["Christopher Grittner", "Michael Johnson"]);
  });
});
