// config.js - Centralized configuration for Chromecast Receiver



// Fallback image URLs (used if GitHub API fails)
export const slideshowImgUrls = [
  // Fallback images - these will be used if GitHub integration fails
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

// Quranic Ayat/Hadith List - 40 Items Focused on Community Values, Quran, Sunnah, Prayer, Masajid, Day of Judgment
export const ayatHadithList = [
  // Prayer and Worship (1-8)
  { ar: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ', en: 'Indeed, prayer prohibits immorality and wrongdoing. (Quran 29:45)' },
  { ar: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', en: 'I did not create the jinn and mankind except to worship Me. (Quran 51:56)' },
  { ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ', en: 'So remember Me; I will remember you. (Quran 2:152)' },
  { ar: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', en: 'And whoever puts his trust in Allah, then He will suffice him. (Quran 65:3)' },
  { ar: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', en: 'Indeed, Allah is with the patient. (Quran 2:153)' },
  { ar: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', en: 'And never give up hope of Allah\'s mercy. (Quran 12:87)' },
  { ar: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', en: 'Indeed, Allah does not allow the reward of the doers of good to be lost. (Quran 9:120)' },
  { ar: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', en: 'And whoever fears Allah, He will make for him a way out. (Quran 65:2)' },

  // Community Values and Brotherhood (9-16)
  { ar: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ', en: 'The believers are but brothers. (Quran 49:10)' },
  { ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', en: 'None of you truly believes until he loves for his brother what he loves for himself. (Bukhari & Muslim)' },
  { ar: 'خَيْرُكُمْ أَحْسَنُكُمْ أَخْلَاقًا', en: 'The best among you are those who have the best manners and character. (Bukhari)' },
  { ar: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ', en: 'Whoever does not thank people has not thanked Allah. (Tirmidhi)' },
  { ar: 'لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِندَ الْغَضَبِ', en: 'The strong man is not the one who can overpower others. The strong man is the one who controls himself when angry. (Bukhari)' },
  { ar: 'يَسِّرُوا وَلَا تُعَسِّرُوا', en: 'Make things easy and do not make them difficult. (Bukhari)' },
  { ar: 'وَلَا تَنَابَزُوا بِالْأَلْقَابِ', en: 'And do not insult one another with nicknames. (Quran 49:11)' },
  { ar: 'إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ', en: 'Indeed, Allah loves the doers of good. (Quran 2:195)' },

  // Quran and Knowledge (17-24)
  { ar: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', en: 'Read in the name of your Lord who created. (Quran 96:1)' },
  { ar: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ', en: 'Indeed, this Quran guides to that which is most upright. (Quran 17:9)' },
  { ar: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ', en: 'And We have certainly made the Quran easy for remembrance. (Quran 54:17)' },
  { ar: 'إِنَّ الَّذِينَ يَتْلُونَ كِتَابَ اللَّهِ وَأَقَامُوا الصَّلَاةَ', en: 'Indeed, those who recite the Book of Allah and establish prayer. (Quran 35:29)' },
  { ar: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ', en: 'Seeking knowledge is obligatory upon every Muslim. (Ibn Majah)' },
  { ar: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا', en: 'Whoever takes a path in search of knowledge. (Abu Dawud)' },
  { ar: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ', en: 'Only those of His servants who have knowledge fear Allah. (Quran 35:28)' },
  { ar: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', en: 'And say: My Lord, increase me in knowledge. (Quran 20:114)' },

  // Sunnah and Following the Prophet (25-32)
  { ar: 'مَنْ أَحْيَا سُنَّتِي فَقَدْ أَحْيَانِي', en: 'Whoever revives my Sunnah has indeed revived me. (Tirmidhi)' },
  { ar: 'مَنْ رَغِبَ عَنْ سُنَّتِي فَلَيْسَ مِنِّي', en: 'Whoever turns away from my Sunnah is not from me. (Bukhari & Muslim)' },
  { ar: 'مَنْ أَطَاعَنِي فَقَدْ أَطَاعَ اللَّهَ', en: 'Whoever obeys me has obeyed Allah. (Bukhari & Muslim)' },
  { ar: 'مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ', en: 'Whoever among you sees an evil, let him change it. (Muslim)' },
  { ar: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ', en: 'None of you truly believes until I am dearer to him than his father. (Bukhari)' },
  { ar: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ', en: 'Indeed, Allah and His angels send blessings upon the Prophet. (Quran 33:56)' },
  { ar: 'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي', en: 'Say: If you love Allah, then follow me. (Quran 3:31)' },

  // Masajid and Community (33-36)
  { ar: 'وَمَنْ أَظْلَمُ مِمَّن مَّنَعَ مَسَاجِدَ اللَّهِ أَن يُذْكَرَ فِيهَا اسْمُهُ', en: 'And who is more unjust than one who prevents the mention of Allah\'s name in His mosques? (Quran 2:114)' },
  { ar: 'مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ', en: 'Whoever builds a mosque for Allah, Allah will build for him a house in Paradise. (Bukhari & Muslim)' },
  { ar: 'إِنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا', en: 'Indeed, the mosques are for Allah, so do not invoke anyone with Allah. (Quran 72:18)' },
  { ar: 'فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ', en: 'In houses which Allah has ordered to be raised and in which His name is mentioned. (Quran 24:36)' },

  // Day of Judgment and Accountability (37-40)
  { ar: 'يَوْمَ تَشْهَدُ عَلَيْهِمْ أَلْسِنَتُهُمْ وَأَيْدِيهِمْ وَأَرْجُلُهُم بِمَا كَانُوا يَعْمَلُونَ', en: 'On the Day when their tongues, hands and feet will bear witness against them as to what they used to do. (Quran 24:24)' },
  { ar: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ * وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ', en: 'So whoever does an atom\'s weight of good will see it. And whoever does an atom\'s weight of evil will see it. (Quran 99:7-8)' },
  { ar: 'يَوْمَ لَا تَمْلِكُ نَفْسٌ لِّنَفْسٍ شَيْئًا', en: 'On the Day when no soul will have power to do anything for another soul. (Quran 82:19)' },
  { ar: 'وَكُلُّ إِنسَانٍ أَلْزَمْنَاهُ طَائِرَهُ فِي عُنُقِهِ', en: 'And every person\'s fate We have fastened around his neck. (Quran 17:13)' }
];

// QR Code Images and Labels
// Using GitHub Pages compatible paths - three QR codes including donation
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
      communityWhatsApp: '/chromecast_stream/images/qr-codes/map-whatsapp.png',
    };
  }
  return {
    mapWebsite: './images/qr-codes/mapitt.png',
    communityWhatsApp: './images/qr-codes/map-whatsapp.png',
  };
}

export const qrImageLabels = {
  mapWebsite: 'Website',
  communityWhatsApp: 'WhatsApp',
};

export const githubConfig = {
  owner: 'itsecretary-map', // Repository owner
  repo: 'chromecast_stream',
  folder: 'images/slideshow', // Slideshow images folder
  enabled: true
};
