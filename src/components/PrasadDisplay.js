import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

/**
 * PradaDisplay Component
 * Renders samagri items with side-entry animations and grid stacking.
 */
const PrasadDisplay = ({ items, isVisible, dhupIcon, isDhupVisible }) => {
    if ((!items || items.length === 0) && (!dhupIcon || !isDhupVisible)) return null;

    return (
        <View style={styles.fullScreenContainer} pointerEvents="none">
            {items.map((item, index) => (
                <PrasadItem
                    key={`prasad-${index}-${item}`}
                    imageSource={item}
                    index={index}
                    totalItems={items.length}
                    isVisible={isVisible}
                />
            ))}
            {dhupIcon && isDhupVisible && (
                <PrasadItem
                    key="dhup-item"
                    imageSource={dhupIcon}
                    index={items.length} // Place in the next slot after prasad
                    totalItems={items.length + 1}
                    isVisible={isDhupVisible}
                    isSingleCentered={true}
                />
            )}
        </View>
    );
};

const PrasadItem = ({ imageSource, index, totalItems, isVisible, isSingleCentered = false }) => {
    const ITEM_SIZE = isSingleCentered ? 100 : 70; // Larger size for Dhup/Diya
    const MAX_PER_ROW = 3;
    const SPACING = 15;
    const ROW_HEIGHT = 60;
    const BASELINE_Y = height * 0.72; // Slightly above Thali

    const translateX = useSharedValue(index % 2 === 0 ? -200 : width + 200);
    const opacity = useSharedValue(0);

    // Calculate Grid Position
    const row = Math.floor(index / MAX_PER_ROW);
    const indexInRow = index % MAX_PER_ROW;
    const itemsInThisRow = isSingleCentered ? 1 : Math.min(MAX_PER_ROW, totalItems - (row * MAX_PER_ROW));

    // Horizontal centering logic
    const rowWidth = (itemsInThisRow * ITEM_SIZE) + ((itemsInThisRow - 1) * SPACING);
    const rowStartX = (width - rowWidth) / 2;
    const targetX = isSingleCentered ? (width - ITEM_SIZE) / 2 : rowStartX + (indexInRow * (ITEM_SIZE + SPACING));
    const targetY = BASELINE_Y - (row * ROW_HEIGHT) - (isSingleCentered ? 80 : 0); // Increased lift to 45px to prevent overlap

    // Entry Side Logic (based on user request)
    // 1 item: Right
    // 2+: Split Left/Right
    useEffect(() => {
        let entryX = 0;
        if (totalItems === 1 || isSingleCentered) {
            entryX = width + 200; // From Right
        } else {
            const leftCount = Math.ceil(itemsInThisRow / 2);
            entryX = indexInRow < leftCount ? -200 : width + 200;
        }

        if (isVisible) {
            translateX.value = entryX;
            opacity.value = 0;

            // Slide In
            translateX.value = withDelay(index * 100, withTiming(targetX, {
                duration: 1000,
                easing: Easing.out(Easing.back(1.5)),
            }));
            opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
        } else {
            // Slide Out
            translateX.value = withTiming(entryX, {
                duration: 800,
                easing: Easing.in(Easing.exp),
            });
            opacity.value = withTiming(0, { duration: 500 });
        }
    }, [isVisible, targetX]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value,
        top: targetY,
    }));

    if (!imageSource) return null;

    return (
        <Animated.View style={[styles.itemContainer, animatedStyle, { width: ITEM_SIZE, height: ITEM_SIZE }]}>
            <Image
                source={imageSource}
                style={styles.image}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 6, // Above Mala, below UI
    },
    itemContainer: {
        position: 'absolute',
        // Dynamic size from Animated.View style if needed, but fixed here for simplicity
        // We'll override these in the component style prop
        // Subtle shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});

export default PrasadDisplay;
