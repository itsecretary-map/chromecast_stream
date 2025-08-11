// config.js - Centralized configuration for Chromecast Receiver



// Fallback image URLs (used if GitHub API fails)
export const slideshowImgUrls = [
  // These will only be used if GitHub integration fails
];

// Quranic Ayat/Hadith List (Arabic + Translation)
export const ayatHadithList = [
  { ar: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ', en: 'Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)' },
  { ar: 'خَيْرُكُمْ أَحْسَنُكُمْ أَخْلَاقًا', en: 'The best among you are those who have the best manners and character. (Bukhari)' },
  { ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ', en: 'So remember Me; I will remember you. (Quran 2:152)' },
  { ar: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ', en: 'Whoever does not thank people has not thanked Allah. (Tirmidhi)' },
  { ar: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ', en: 'And He found you lost and guided [you]. (Quran 93:7)' },
  { ar: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِندَ الْغَضَبِ', en: 'The strong man is not the one who can overpower others. The strong man is the one who controls himself when angry. (Bukhari)' },
  { ar: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', en: 'And your Lord is going to give you, and you will be satisfied. (Quran 93:5)' },
  { ar: 'يَسِّرُوا وَلَا تُعَسِّرُوا', en: 'Make things easy and do not make them difficult. (Bukhari)' },
  { ar: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', en: 'And whoever puts his trust in Allah, then He will suffice him. (Quran 65:3)' },
  { ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', en: 'None of you truly believes until he loves for his brother what he loves for himself. (Bukhari & Muslim)' }
];

// QR Code Images and Labels
export const qrImageUrls = {
  mapWebsite: 'https://lh3.googleusercontent.com/pw/AP1GczMiSbMYQ1chhnVDpXwImM1H0Rp17RSa8uuGaPLCb0WPxRT8YNa2yA3Jce_Id76WDTb2gVxzjJ0iKmY6hDm8HDT6XApjx3cDdDzVXpRC89cODpoberK3bLCmqasSUTIX3bXt4VzBFvnhZmo-ukukJhYz=w450-h450-s-no-gm?authuser=0',
  mohidDonation: 'https://lh3.googleusercontent.com/pw/AP1GczME-q_Z1uZsf6O03ycHY5UCOXZx45f4XblJAuy9qt1m2f4xdQKFBzJKZKycsEIrpyO-jXhC8WAh1iR-QPLmYjcbBLxL4hxHlRoPWxpHE6ZLH3Y708qJ6yXcY_WiBHmkBJsmL7WkOEhI-nHqAL5R7VWQ=w450-h450-s-no-gm?authuser=0',
  communityWhatsApp: 'https://lh3.googleusercontent.com/pw/AP1GczNzysZmpkevxf8TpH2-afM-4ph5OVNunXyKdf5lXyingNMnYGhQpBulHtUE20dq5xvONx0SOibIpvxVQ4LQcZcYc403qfqTpRx-mJSKShaFvJgJTONUrJF3p9dlNpzIjR4DX2moKvPOreG8pg6iy613=w450-h450-s-no-gm?authuser=0',
};

export const qrImageLabels = {
  mapWebsite: 'MAP Website',
  mohidDonation: 'Mohid Donation',
  communityWhatsApp: 'Community WhatsApp',
};

export const githubConfig = {
  owner: 'itsecretary-map', // Repository owner
  repo: 'chromecast_stream',
  folder: 'images/slideshow', // Full path to slideshow folder
  enabled: true
};
