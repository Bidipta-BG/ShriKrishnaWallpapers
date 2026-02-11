import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
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
import GALLERY_IMAGES from '../data/galleryData';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;
const SAVED_IMAGES_KEY = 'saved_images_ids';

const SavedScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [savedImages, setSavedImages] = useState([]);

    useFocusEffect(
        useCallback(() => {
            loadSavedImages();
        }, [])
    );

    const loadSavedImages = async () => {
        try {
            const storedIds = await AsyncStorage.getItem(SAVED_IMAGES_KEY);
            if (storedIds) {
                const ids = JSON.parse(storedIds);
                // Filter GALLERY_IMAGES to find the ones that match saved IDs
                const filtered = GALLERY_IMAGES.filter(img => ids.includes(img.id));
                setSavedImages(filtered);
            } else {
                setSavedImages([]);
            }
        } catch (error) {
            console.error('Error loading saved images:', error);
        }
    };

    const renderGridItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('FullImage', { initialIndex: item.globalIndex })}
        >
            <Image source={item.source} style={styles.cardImage} />
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

            {savedImages.length > 0 ? (
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
