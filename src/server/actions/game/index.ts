/**
 * Game関連アクションの一括エクスポート
 */

// Error Hunter
export {
    startGame,
    clickError,
    getMatchWithEvents,
    finishGame,
    getMatchProgress,
    checkAutoFinish,
} from './errorHunterActions'

// NULL HAND
export {
    startJankenMatch,
    getHostStats,
    setHostChoice,
    setGuestHand,
    getJankenEvent,
    getLatestJankenEvent,
    getLatestJankenEventWithStats,
    getMatchScores,
    startNextTurn,
    finishJanken,
    markNextRoundReady,
} from './nullHandActions'


