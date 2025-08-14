// config.js - Centralized configuration for Chromecast Receiver



// Fallback image URLs (used if GitHub API fails)
export const slideshowImgUrls = [
  // Fallback images - these will be used if GitHub integration fails
  './images/slideshow/imam_schedule.jpg',
  './images/slideshow/sundayschool.jpg',
  'https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=MAP+Community',
  'https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Welcome+to+MAP',
  'https://via.placeholder.com/800x600/FF9800/FFFFFF?text=Prayer+Times'
];

// Function to get GitHub Pages compatible image paths
export function getImagePath(imageName) {
  const isGitHubPages = typeof window !== 'undefined' && (
    window.location.hostname === 'itsecretary-map.github.io'
  );
  
  if (isGitHubPages) {
    return `/chromecast_stream/images/slideshow/${imageName}`;
  }
  return `./images/slideshow/${imageName}`;
}

// Function to get GitHub Pages compatible QR code image paths
export function getQrImagePath(imageName) {
  const isGitHubPages = typeof window !== 'undefined' && (
    window.location.hostname === 'itsecretary-map.github.io'
  );
  
  if (isGitHubPages) {
    return `/chromecast_stream/images/qr-codes/${imageName}`;
  }
  return `./images/qr-codes/${imageName}`;
}

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
// Using GitHub Pages compatible paths - only two QR codes to reduce row height
export function getQrImageUrls() {
  // More robust GitHub Pages detection
  const isGitHubPages = typeof window !== 'undefined' && (
    window.location.hostname === 'itsecretary-map.github.io' ||
    window.location.pathname.includes('/chromecast_stream/') ||
    window.location.href.includes('github.io')
  );
  
  console.log('🔍 GitHub Pages detection:', {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    href: window.location.href,
    isGitHubPages: isGitHubPages
  });
  
  if (isGitHubPages) {
    return {
      mapWebsite: '/chromecast_stream/images/qr-codes/mapitt.png',
      communityWhatsApp: '/chromecast_stream/images/qr-codes/whatsapp_group.png',
    };
  }
  return {
    mapWebsite: './images/qr-codes/mapitt.png',
    communityWhatsApp: './images/qr-codes/whatsapp_group.png',
  };
}

export const qrImageLabels = {
  mapWebsite: 'MAP Website',
  communityWhatsApp: 'WhatsApp',
};

export const githubConfig = {
  owner: 'itsecretary-map', // Repository owner
  repo: 'chromecast_stream',
  folder: 'images/slideshow', // Slideshow images folder
  enabled: true
};
