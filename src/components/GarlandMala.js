import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

/**
 * GarlandMala Component
 * Renders multiple vertical strings of garland items (Curtain Style)
 */
const GarlandMala = ({ imageSource, isVisible }) => {
    if (!imageSource) return null;
    const translateY = useSharedValue(-1000); // Start way off-screen

    useEffect(() => {
        if (isVisible) {
            // Slide down
            translateY.value = withTiming(0, {
                duration: 1800,
                easing: Easing.out(Easing.poly(4)),
            });
        } else {
            // Slide back up
            translateY.value = withTiming(-1000, {
                duration: 1200,
                easing: Easing.in(Easing.exp),
            });
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    // Configuration for vertical strings
    const STRING_COUNT = 10;
    const BEADS_PER_STRING = 15;
    const BEAD_SIZE = 50;
    const OVERLAP = 15; // Vertical overlap between beads in a string

    const strings = Array.from({ length: STRING_COUNT }).map((_, stringIndex) => {
        // Even spacing across the width
        const leftPos = (stringIndex * (width / (STRING_COUNT - 1)));

        // Flatten the edges for a "curtain" effect: 
        // string 2 (idx 1) behaves like string 1 (idx 0)
        // string 9 (idx 8) behaves like string 10 (idx 9)
        let effectiveIdx = stringIndex;
        if (stringIndex === 1) effectiveIdx = 0;
        if (stringIndex === 8) effectiveIdx = 9;

        // Calculate bead count for a sharp inverted "V" arch (^) 
        const centerDist = Math.abs(effectiveIdx - 4.5);
        const normalizedDist = centerDist / 4.5; // 0 to 1

        // Scale from 5 beads in middle up to 16 at sides for a BALANCED arch
        const currentBeadCount = Math.floor(5 + (normalizedDist * normalizedDist) * 11);

        const beads = Array.from({ length: currentBeadCount }).map((_, beadIndex) => {
            return (
                <View
                    key={`${stringIndex}-${beadIndex}`}
                    style={[
                        styles.beadContainer,
                        {
                            top: beadIndex * (BEAD_SIZE - OVERLAP),
                            width: BEAD_SIZE,
                            height: BEAD_SIZE,
                            zIndex: 100 - beadIndex
                        }
                    ]}
                >
                    <Image
                        source={imageSource}
                        style={styles.beadImage}
                        resizeMode="contain"
                    />
                </View>
            );
        });

        return (
            <View key={stringIndex} style={[styles.stringColumn, { left: leftPos }]}>
                {beads}
            </View>
        );
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
            {strings}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5, // Behind buttons but in front of deity
    },
    stringColumn: {
        position: 'absolute',
        top: -50, // Start slightly above the top edge
        width: 60,
        height: height,
    },
    beadContainer: {
        position: 'absolute',
        // Premium shadows
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    beadImage: {
        width: '100%',
        height: '100%',
    },
});

export default GarlandMala;
