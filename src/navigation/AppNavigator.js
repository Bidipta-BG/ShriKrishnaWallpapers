
import { createStackNavigator } from '@react-navigation/stack';
import ChantingScreen from '../screens/ChantingScreen';
import DailyDarshanScreen from '../screens/DailyDarshanScreen';
import FestivalScreen from '../screens/FestivalScreen';
import HomeScreen from '../screens/HomeScreen'; // Assuming this exists or will be main landing
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';
import MantraSelectionScreen from '../screens/MantraSelectionScreen';
import MantrasScreen from '../screens/MantrasScreen';
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
            <Stack.Screen name="Festivals" component={FestivalScreen} />
            <Stack.Screen name="Slokas" component={SlokasScreen} />
            <Stack.Screen name="MantraSelection" component={MantraSelectionScreen} />
            <Stack.Screen name="Mantras" component={MantrasScreen} />
            <Stack.Screen name="Chanting" component={ChantingScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
