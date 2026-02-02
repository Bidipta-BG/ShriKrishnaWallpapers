
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../utils/constants';

const { width } = Dimensions.get('window');

const LanguageSelectionScreen = () => {
    const { selectLanguage } = useLanguage();
    const navigation = useNavigation();

    const handleLanguageSelect = (langCode) => {
        selectLanguage(langCode);
        navigation.replace('DailyDarshan');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.button}
            onPress={() => handleLanguageSelect(item.code)}
        >
            <Text style={styles.buttonText}>{item.nativeName} ({item.name})</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FF9933', '#FFFFFF', '#138808']}
                style={styles.background}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.content}>
                    <Text style={styles.title}>Shri Krishna Wallpapers</Text>
                    <Text style={styles.subtitle}>Choose your Language</Text>
                    <Text style={styles.subtitleHindi}>अपनी भाषा चुनें</Text>

                    <FlatList
                        data={LANGUAGES}
                        renderItem={renderItem}
                        keyExtractor={item => item.code}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#8B4513',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 20,
        color: '#333',
        marginBottom: 5,
    },
    subtitleHindi: {
        fontSize: 22,
        color: '#333',
        marginBottom: 20,
        fontWeight: '500',
    },
    listContainer: {
        paddingBottom: 40,
        alignItems: 'center',
        width: '100%',
    },
    button: {
        backgroundColor: '#FFD700',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 30,
        width: width * 0.8,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#8B0000',
    }
});

export default LanguageSelectionScreen;
