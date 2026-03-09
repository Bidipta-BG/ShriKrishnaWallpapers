
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import appJson from './app.json';
import LoadingOverlay from './src/components/LoadingOverlay';
import UpdateModal from './src/components/UpdateModal';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { LoadingProvider } from './src/contexts/LoadingContext';
import AppNavigator from './src/navigation/AppNavigator';
import { isVersionLower } from './src/utils/versionHelper';

const APP_VERSION = appJson.expo.version;

const AppContent = () => {
    const { language, isLoading, clearLanguage, setUIReady, selectLanguage, isUIReady } = useLanguage();
    const [updateConfig, setUpdateConfig] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        checkAppVersion();
    }, []);

    const checkAppVersion = async () => {
        try {
            const response = await fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/system/version-check');
            const result = await response.json();

            if (result.success && result.data) {
                const config = result.data;
                const { latestVersion, minRequiredVersion, maintenanceMode } = config;

                // 1. Check Maintenance Mode
                if (maintenanceMode) {
                    setUpdateConfig(config);
                    setShowUpdateModal(true);
                    return;
                }

                // 2. Check Force Update
                if (isVersionLower(APP_VERSION, minRequiredVersion)) {
                    setUpdateConfig({ ...config, isForceUpdate: true });
                    setShowUpdateModal(true);
                    return;
                }

                // 3. Check Optional Update
                if (isVersionLower(APP_VERSION, latestVersion)) {
                    setUpdateConfig(config);
                    setShowUpdateModal(true);
                }
            }
        } catch (error) {
            console.error('Version check failed:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8E1' }}>
                <ActivityIndicator size="large" color="#FF9933" />
            </View>
        );
    }

    return (
        <NavigationContainer key={language ? 'user' : 'guest'}>
            <AppNavigator initialRouteName={language ? "DailyDarshan" : "LanguageSelection"} />
            <LoadingOverlay />
            <UpdateModal
                visible={showUpdateModal}
                config={updateConfig}
                onIgnore={() => setShowUpdateModal(false)}
            />
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
