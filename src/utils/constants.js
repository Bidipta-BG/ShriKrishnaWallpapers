
export const LANGUAGES = [

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
        code: 'en',
        name: 'English',
        nativeName: 'English',
        welcome: 'Welcome Back!',
        changeBtn: 'Change Language',
        continueBtn: 'Continue',
        continueIn: 'You are continuing in'
    }
];

export const getLanguageByCode = (code) => LANGUAGES.find(l => l.code === code);
