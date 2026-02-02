import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MUSIC_TRACKS } from '../data/music';

const REPEAT_MODES = ['Off', '1', '2', '3', 'Loop'];

const MantrasScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const [trackRepeatModes, setTrackRepeatModes] = useState({});

    const playTrack = (track) => {
        // Navigate to DailyDarshan and pass the track
        navigation.navigate('DailyDarshan', {
            selectedTrack: track,
            repeatMode: trackRepeatModes[track.id] || 0
        });
    };

    const handleSetAlarm = (trackTitle) => {
        Alert.alert("Set Alarm", `Setting "${trackTitle}" as alarm tone... \n(Feature coming soon in Alarm Clock)`);
    };

    const toggleRepeatMode = (trackId) => {
        setTrackRepeatModes((prev) => {
            const currentMode = prev[trackId] || 0;
            const nextMode = (currentMode + 1) % REPEAT_MODES.length;
            return { ...prev, [trackId]: nextMode };
        });
    };

    // Helper to get mode for a track
    const getTrackModeIndex = (trackId) => trackRepeatModes[trackId] || 0;

    const renderItem = ({ item }) => {
        const modeIndex = getTrackModeIndex(item.id);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.icon}>🎵</Text>
                    <Text style={styles.title}>{item.title}</Text>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[styles.playButton, { backgroundColor: '#CD9730' }]}
                        onPress={() => playTrack(item)}
                    >
                        <Text style={styles.playButtonText}>▶ Play</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionButton} onPress={() => toggleRepeatMode(item.id)}>
                        <Text style={styles.optionText}>🔁 {REPEAT_MODES[modeIndex]}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleSetAlarm(item.title)}>
                        <Text style={styles.actionText}>⏰ Set Alarm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Mantras</Text>
            </View>

            <FlatList
                data={MUSIC_TRACKS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8E1', // Light cream background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#CD9730',
        elevation: 4,
    },
    backButton: {
        padding: 10,
    },
    backButtonText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
    },
    listContent: {
        padding: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    activeCard: {
        borderColor: '#CD9730',
        borderWidth: 2,
        backgroundColor: '#fffae6',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    icon: {
        fontSize: 24,
        marginRight: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    activeTitle: {
        color: '#8b0000',
        fontWeight: 'bold',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    playButton: {
        backgroundColor: '#333',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    playButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    optionButton: {
        backgroundColor: '#eee',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        color: '#333',
        fontSize: 12,
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    actionText: {
        color: '#E74C3C',
        fontWeight: '600',
        marginLeft: 5,
    },
});

export default MantrasScreen;
