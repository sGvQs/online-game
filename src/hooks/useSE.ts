export const useSE = () => {
    const play = (name: 'error') => {
        const files = {
            error: '/se/error-se.mp3',
        };

        const audio = new Audio(files[name]);
        audio.volume = 0.2;
        audio.play().catch(() => { }); // 連続で叩かれた時のエラー対策
    };

    return { play };
};