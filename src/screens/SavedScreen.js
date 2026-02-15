import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;
const SAVED_IMAGES_KEY = 'saved_images_ids';

const SavedScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [savedImages, setSavedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadSavedImages();
        }, [])
    );

    const loadSavedImages = async () => {
        try {
            setIsLoading(true);
            const [storedIds, response] = await Promise.all([
                AsyncStorage.getItem(SAVED_IMAGES_KEY),
                fetch('https://api.thevibecoderagency.online/api/srikrishna-aarti/gallery')
            ]);

            if (!response.ok) throw new Error('Failed to fetch gallery');
            const data = await response.json();

            // Flatten all images from API
            const allImages = [];
            const seenIds = new Set();

            [...data.heroSections, ...data.categories].forEach(section => {
                section.items.forEach(item => {
                    if (!seenIds.has(item.id)) {
                        allImages.push(item);
                        seenIds.add(item.id);
                    }
                });
            });

            if (storedIds) {
                const ids = JSON.parse(storedIds);
                const filtered = allImages.filter(img => ids.includes(img.id));
                setSavedImages(filtered);
            } else {
                setSavedImages([]);
            }
        } catch (error) {
            console.error('Error loading saved images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderGridItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('FullImage', {
                initialIndex: index,
                allImages: savedImages
            })}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                defaultSource={require('../assets/images/default_darshan.jpg')}
            />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="#4dabf7" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Divine</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#4dabf7" />
                    <Text style={styles.emptySubText}>Fetching divine collection...</Text>
                </View>
            ) : savedImages.length > 0 ? (
                <FlatList
                    data={savedImages}
                    renderItem={renderGridItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={80} color="#333" />
                    <Text style={styles.emptyText}>No saved images yet</Text>
                    <Text style={styles.emptySubText}>Save your favorite divine wallpapers to see them here.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1A1A1A',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    gridCard: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH * 1.5,
        margin: 7.5,
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default SavedScreen;
