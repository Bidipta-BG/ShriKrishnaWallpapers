import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReelsScreen = ({ navigation }) => {
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        checkVote();
    }, []);

    const checkVote = async () => {
        try {
            const vote = await AsyncStorage.getItem('user_vote_reels_feature');
            if (vote) {
                setHasVoted(true);
            }
        } catch (error) {
            console.error('Error checking vote:', error);
        }
    };

    const handleVote = async (vote) => {
        try {
            await AsyncStorage.setItem('user_vote_reels_feature', vote);
            setHasVoted(true);
        } catch (error) {
            console.error('Error saving vote:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reels</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="videocam" size={60} color="#FFD700" />
                </View>

                <Text style={styles.title}>Devotional Shorts</Text>
                <Text style={styles.subtitle}>Experience devotion in motion</Text>

                <View style={styles.featureList}>
                    <View style={styles.featureItem}>
                        <Ionicons name="play-circle-outline" size={24} color="#9c6ce6" />
                        <Text style={styles.featureText}>Watch short <Text style={styles.highlight}>devotional clips</Text></Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="musical-notes-outline" size={24} color="#9c6ce6" />
                        <Text style={styles.featureText}>Daily Darshan <Text style={styles.highlight}>highlights</Text> with music</Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Ionicons name="share-social-outline" size={24} color="#9c6ce6" />
                        <Text style={styles.featureText}>Share spiritual moments instantly</Text>
                    </View>
                </View>

                <View style={styles.comingSoonContainer}>
                    <Text style={styles.comingSoonText}>Coming Soon...</Text>

                    {!hasVoted ? (
                        <>
                            <Text style={styles.feedbackPrompt}>Would you like to watch short devotional videos?</Text>
                            <View style={styles.voteButtonsContainer}>
                                <TouchableOpacity
                                    style={[styles.voteButton, styles.voteButtonYes]}
                                    onPress={() => handleVote('yes')}
                                >
                                    <Text style={styles.voteButtonText}>YES! 😍</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.voteButton, styles.voteButtonNo]}
                                    onPress={() => handleVote('no')}
                                >
                                    <Text style={styles.voteButtonText}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.votedContainer}>
                            <Ionicons name="checkmark-circle" size={40} color="#4caf50" />
                            <Text style={styles.votedText}>Thank you for your response! 🙏</Text>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
        // backgroundColor: '#121212', // Keep same comment style as GenerateScreen
    },
    backButton: {
        padding: 5,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1a1a10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 28,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#AAA',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 22,
    },
    featureList: {
        width: '100%',
        marginBottom: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    featureText: {
        color: '#ddd',
        fontSize: 15,
        marginLeft: 15,
        flex: 1,
    },
    highlight: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    comingSoonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    comingSoonText: {
        color: '#4dabf7', // Neon blue for tech feel
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 15,
    },
    feedbackPrompt: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    voteButtonsContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    voteButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
    },
    voteButtonYes: {
        backgroundColor: '#9c6ce6',
        shadowColor: '#9c6ce6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    voteButtonNo: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#555',
    },
    voteButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    votedContainer: {
        alignItems: 'center',
        gap: 10,
    },
    votedText: {
        color: '#4caf50',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReelsScreen;
