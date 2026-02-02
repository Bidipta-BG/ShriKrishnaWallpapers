
export const LANGUAGES = [
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        welcome: 'Welcome Back!',
        changeBtn: 'Change Language',
        continueBtn: 'Continue',
        continueIn: 'You are continuing in'
    },
    {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिंदी',
        welcome: 'स्वागत है!',
        changeBtn: 'भाषा बदलें',
        continueBtn: 'जारी रखें',
        continueIn: 'आप जारी रख रहे हैं'
    },
    {
        code: 'bn',
        name: 'Bengali',
        nativeName: 'বাংলা',
        welcome: 'স্বাগতম!',
        changeBtn: 'ভাষা পরিবর্তন করুন',
        continueBtn: 'চালিয়ে যান',
        continueIn: 'আপনি চালিয়ে যাচ্ছেন'
    },
    {
        code: 'mr',
        name: 'Marathi',
        nativeName: 'मराठी',
        welcome: 'स्वागत आहे!',
        changeBtn: 'भाषा बदला',
        continueBtn: 'पुढे जा',
        continueIn: 'तुम्ही पुढे जात आहात'
    },
    {
        code: 'gu',
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
        welcome: 'સ્વાગત છે!',
        changeBtn: 'ભાષા બદલો',
        continueBtn: 'ચાલુ રાખો',
        continueIn: 'તમે ચાલુ રાખી રહ્યા છો'
    },
    {
        code: 'ta',
        name: 'Tamil',
        nativeName: 'தமிழ்',
        welcome: 'நல்வரவு!',
        changeBtn: 'மொழியை மாற்றவும்',
        continueBtn: 'தொடரவும்',
        continueIn: 'நீங்கள் தொடர்கிறீர்கள்'
    },
    {
        code: 'te',
        name: 'Telugu',
        nativeName: 'తెలుగు',
        welcome: 'స్వాగతం!',
        changeBtn: 'భాషను మార్చండి',
        continueBtn: 'కొనసాగించండి',
        continueIn: 'మీరు కొనసాగిస్తున్నారు'
    },
    {
        code: 'kn',
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        welcome: 'ಸ್ವಾಗತ!',
        changeBtn: 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
        continueBtn: 'ಮುಂದುವರಿಸಿ',
        continueIn: 'ನೀವು ಮುಂದುವರಿಸುತ್ತಿದ್ದೀರಿ'
    },
    {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        welcome: 'സ്വാഗതം!',
        changeBtn: 'ഭാഷ മാറ്റുക',
        continueBtn: 'തുടരുക',
        continueIn: 'നിങ്ങൾ തുടരുന്നു'
    },
    {
        code: 'pa',
        name: 'Punjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ!',
        changeBtn: 'ਭਾਸ਼ਾ ਬਦਲੋ',
        continueBtn: 'ਜਾਰੀ ਰੱਖੋ',
        continueIn: 'ਤੁਸੀਂ ਜਾਰੀ ਰੱਖ ਰਹੇ ਹੋ'
    },
    {
        code: 'or',
        name: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        welcome: 'ସ୍ୱାଗତ!',
        changeBtn: 'ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ',
        continueBtn: 'ଜାରି ରଖନ୍ତୁ',
        continueIn: 'ଆପଣ ଜାରି ରଖିଛନ୍ତି'
    },
];

export const getLanguageByCode = (code) => LANGUAGES.find(l => l.code === code);
