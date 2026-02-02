
import { StyleSheet, Text, View } from 'react-native';

const FestivalScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Festival Screen Placeholder</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
    }
});

export default FestivalScreen;
