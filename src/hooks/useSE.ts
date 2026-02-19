export const useSE = () => {
    const play = (name: 'error' | 'chime' | 'tada' | 'select' | 'submit') => {
        const files = {
            error: '/se/error-se.mp3',
            chime: '/se/chime-se.mp3',
            tada: '/se/tada-se.mp3',
            select: '/se/select-se.mp3',
            submit: '/se/submit-se.mp3',
        };

        const audio = new Audio(files[name]);
        audio.volume = 0.1;
        audio.play().catch(() => { }); // 連続で叩かれた時のエラー対策
    };

    return { play };
};