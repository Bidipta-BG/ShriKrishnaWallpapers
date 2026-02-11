import { createStackNavigator } from '@react-navigation/stack';
import CategoryGridScreen from '../screens/CategoryGridScreen';
import ChantingScreen from '../screens/ChantingScreen';
import DailyDarshanScreen from '../screens/DailyDarshanScreen';
import FullImageScreen from '../screens/FullImageScreen';
import GalleryScreen from '../screens/GalleryScreen';
import GenerateScreen from '../screens/GenerateScreen';
import HomeScreen from '../screens/HomeScreen';
import ImageDownloadScreen from '../screens/ImageDownloadScreen';
import ImageShareScreen from '../screens/ImageShareScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import MantraSelectionScreen from '../screens/MantraSelectionScreen';
import ReelsScreen from '../screens/ReelsScreen';
import SavedScreen from '../screens/SavedScreen';
import ScheduleDarshanScreen from '../screens/ScheduleDarshanScreen';
import SlokasScreen from '../screens/SlokasScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ initialRouteName = 'LanguageSelection' }) => {
    return (
        <Stack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                animationEnabled: true,
            }}
        >
            <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
            <Stack.Screen name="DailyDarshan" component={DailyDarshanScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Slokas" component={SlokasScreen} />
            <Stack.Screen name="MantraSelection" component={MantraSelectionScreen} />
            <Stack.Screen name="Gallery" component={GalleryScreen} />
            <Stack.Screen name="CategoryGrid" component={CategoryGridScreen} />
            <Stack.Screen name="FullImage" component={FullImageScreen} />
            <Stack.Screen name="Chanting" component={ChantingScreen} />
            <Stack.Screen name="ScheduleDarshan" component={ScheduleDarshanScreen} />
            <Stack.Screen name="Reels" component={ReelsScreen} />
            <Stack.Screen name="Generate" component={GenerateScreen} />
            <Stack.Screen name="Saved" component={SavedScreen} />
            <Stack.Screen name="ImageShare" component={ImageShareScreen} />
            <Stack.Screen name="ImageDownload" component={ImageDownloadScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
