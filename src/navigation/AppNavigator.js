import { createStackNavigator } from '@react-navigation/stack';
import ChantingScreen from '../screens/ChantingScreen';
import DailyDarshanScreen from '../screens/DailyDarshanScreen';
import HomeScreen from '../screens/HomeScreen'; // Assuming this exists or will be main landing
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import MantraSelectionScreen from '../screens/MantraSelectionScreen';

import SlokasScreen from '../screens/SlokasScreen';

import GalleryScreen from '../screens/GalleryScreen';
import GenerateScreen from '../screens/GenerateScreen';
import ReelsScreen from '../screens/ReelsScreen';
import SavedScreen from '../screens/SavedScreen';
import ScheduleDarshanScreen from '../screens/ScheduleDarshanScreen';

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
            <Stack.Screen name="Chanting" component={ChantingScreen} />
            <Stack.Screen name="ScheduleDarshan" component={ScheduleDarshanScreen} />
            <Stack.Screen name="Reels" component={ReelsScreen} />
            <Stack.Screen name="Generate" component={GenerateScreen} />
            <Stack.Screen name="Saved" component={SavedScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
