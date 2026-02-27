import AsyncStorage from '@react-native-async-storage/async-storage';

const SLOKA_PROGRESS_KEY = 'sloka_study_progress';

/**
 * Default progress state:
 * - bg_01_01 is the only verse unlocked initially.
 */
const DEFAULT_PROGRESS = {
    unlockedVerses: ['bg_01_01', 'sb_01_01', 'rk_01_01'], // First verse of each book
    completedVerses: [],
    unlockedChapters: ['bg_01', 'sb_01', 'rk_01'],
    unlockedBooks: ['bg', 'sb', 'rk']
};

export const loadSlokaProgress = async () => {
    try {
        const saved = await AsyncStorage.getItem(SLOKA_PROGRESS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    } catch (e) {
        console.error('Error loading sloka progress:', e);
        return DEFAULT_PROGRESS;
    }
};

export const saveSlokaProgress = async (progress) => {
    try {
        await AsyncStorage.setItem(SLOKA_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
        console.error('Error saving sloka progress:', e);
    }
};

export const resetSlokaProgress = async () => {
    try {
        await AsyncStorage.removeItem(SLOKA_PROGRESS_KEY);
        return DEFAULT_PROGRESS;
    } catch (e) {
        console.error('Error resetting sloka progress:', e);
        return DEFAULT_PROGRESS;
    }
};

/**
 * Mark a verse as complete and unlock the next sequence.
 * This should be called when the timer finishes in SlokaStudyScreen.
 */
export const completeVerse = async (verseId, bookData) => {
    const progress = await loadSlokaProgress();

    if (!progress.completedVerses.includes(verseId)) {
        progress.completedVerses.push(verseId);
    }

    // Logic to find and unlock the NEXT verse
    const nextVerseId = findNextVerseId(verseId, bookData);
    if (nextVerseId && !progress.unlockedVerses.includes(nextVerseId)) {
        progress.unlockedVerses.push(nextVerseId);

        // If next verse is in a new chapter, unlock that chapter too
        const chapterId = nextVerseId.split('_').slice(0, 2).join('_');
        if (!progress.unlockedChapters.includes(chapterId)) {
            progress.unlockedChapters.push(chapterId);
        }
    }

    // Logic to check if an entire book is complete to unlock the next book
    const nextBookId = checkAndUnlockNextBook(verseId, bookData, progress);
    if (nextBookId && !progress.unlockedBooks.includes(nextBookId)) {
        progress.unlockedBooks.push(nextBookId);
    }

    await saveSlokaProgress(progress);
    return progress;
};

const findNextVerseId = (currentVerseId, bookData) => {
    for (let b = 0; b < bookData.length; b++) {
        const book = bookData[b];
        for (let c = 0; c < book.chapters.length; c++) {
            const chapter = book.chapters[c];
            for (let v = 0; v < chapter.verses.length; v++) {
                if (chapter.verses[v].id === currentVerseId) {
                    // Check next verse in SAME chapter
                    if (v + 1 < chapter.verses.length) {
                        return chapter.verses[v + 1].id;
                    }
                    // Check first verse in NEXT chapter
                    if (c + 1 < book.chapters.length) {
                        const nextChapter = book.chapters[c + 1];
                        if (nextChapter.verses.length > 0) {
                            return nextChapter.verses[0].id;
                        }
                    }
                }
            }
        }
    }
    return null;
};

const checkAndUnlockNextBook = (currentVerseId, bookData, progress) => {
    // Basic logic: if this was the last verse of the last chapter of a book, unlock the next book
    // For now, we'll keep it simple: finding the current book index
    const bookId = currentVerseId.split('_')[0];
    const bookIndex = bookData.findIndex(b => b.id === bookId);

    if (bookIndex !== -1 && bookIndex + 1 < bookData.length) {
        // Here we could add a check if ALL verses in bookIndex are in progress.completedVerses
        return bookData[bookIndex + 1].id;
    }
    return null;
};
