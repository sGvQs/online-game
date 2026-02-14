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
    setInitialHand,
    confirmShowcase,
    setFinalHostHand,
    setGuestHand,
    getJankenEvent,
    getLatestJankenEvent,
    startNextTurn,
    finishJanken,
} from './nullHandActions'
