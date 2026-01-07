const translations = {
  en: {
    gameTitle: "Kelmat",
    tagline: "Challenge your friends in real-time!",
    enterName: "Enter Your Name",
    welcome: "Welcome, {username}!",
    playerName: "Player Name",
    namePlaceholder: "Enter your display name...",
    gameType: "Choose Game Type",
    joinGame: "Join Existing Game",
    joinSubtitle: "Play with friends using a code",
    createGame: "Create New Game",
    createSubtitle: "Host a new game and invite friends",
    gameCode: "Game Code",
    codePlaceholder: "ABCDEF",
    // Add more translations as needed
  },
  ar: {
    gameTitle: "كلمات",
    tagline: "تحدى أصدقائك في الوقت الحقيقي!",
    enterName: "أدخل اسمك",
    welcome: "مرحباً، {username}!",
    playerName: "اسم اللاعب",
    namePlaceholder: "أدخل اسمك...",
    gameType: "اختر نوع اللعبة",
    joinGame: "انضم إلى لعبة موجودة",
    joinSubtitle: "العب مع الأصدقاء باستخدام كود",
    createGame: "أنشئ لعبة جديدة",
    createSubtitle: "استضف لعبة جديدة وادعو الأصدقاء",
    gameCode: "كود اللعبة",
    codePlaceholder: "ABCDEF",
  },
};

export const t = (key, language = "english", params = {}) => {
  const lang = language === "arabic" ? "ar" : "en";
  let text = translations[lang][key] || key;

  // Replace parameters
  Object.keys(params).forEach((param) => {
    text = text.replace(`{${param}}`, params[param]);
  });

  return text;
};
