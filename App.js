
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoadingOverlay from './src/components/LoadingOverlay';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { LoadingProvider } from './src/contexts/LoadingContext';
import AppNavigator from './src/navigation/AppNavigator';

const AppContent = () => {
    const { language, isLoading, clearLanguage, setUIReady, selectLanguage, isUIReady } = useLanguage();

    const [selectedLangObj, setSelectedLangObj] = useState(null);

    useEffect(() => {
        if (!isLoading && !isUIReady) {
            // ALWAYS show the selection popup on launch, acting as a "Gate"
            Alert.alert(
                "Welcome! / नमस्ते! 🙏",
                "Please select your language.\nकृपया अपनी भाषा चुनें।",
                [
                    {
                        text: "English",
                        onPress: () => {
                            selectLanguage('en');
                            setTimeout(() => setUIReady(true), 500);
                        }
                    },
                    {
                        text: "हिंदी (Hindi)",
                        onPress: () => {
                            selectLanguage('hi');
                            setTimeout(() => setUIReady(true), 500);
                        }
                    }
                ],
                { cancelable: false }
            );
        }
    }, [isLoading, isUIReady]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
                <ActivityIndicator size="large" color="#FF9933" />
            </View>
        );
    }

    return (
        <NavigationContainer key={language ? 'user' : 'guest'}>
            {/* Always start with DailyDarshan, language choice happens via Alert on top */}
            <AppNavigator initialRouteName="DailyDarshan" />
            <LoadingOverlay />
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <LoadingProvider>
                <LanguageProvider>
                    <AppContent />
                </LanguageProvider>
            </LoadingProvider>
        </SafeAreaProvider>
    );
}
