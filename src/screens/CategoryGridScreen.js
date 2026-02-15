import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

const PLACEHOLDER_IMAGE = require('../assets/images/default_darshan.jpg');
const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 45) / 2;

const CategoryGridScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const insets = useSafeAreaInsets();

    const { title, items, allImages } = route.params || { title: 'Category', items: [], allImages: [] };

    const renderGridItem = ({ item }) => (
        <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation.navigate('FullImage', {
                initialIndex: item.globalIndex,
                allImages: allImages // Pass the pre-built array
            })}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
                defaultSource={PLACEHOLDER_IMAGE}
                onError={(e) => console.log('Image failed to load:', item.imageUrl)}
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
                <Text style={styles.headerTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={items || []}
                renderItem={renderGridItem}
                keyExtractor={item => item?.id?.toString() || Math.random().toString()}
                numColumns={2}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            />
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
});

export default CategoryGridScreen;
