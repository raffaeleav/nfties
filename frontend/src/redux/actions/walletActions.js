export const SET_CONNECTED = 'SET_CONNECTED';
export const SET_WALLET_ADDRESS = 'SET_WALLET_ADDRESS';
export const SET_IS_MODERATOR = 'SET_IS_MODERATOR';
export const SET_MODERATOR_ADDRESS = 'SET_MODERATOR_ADDRESS';
export const SET_IS_LOADING = 'SET_IS_LOADING';

export const setIsConnected = (isConnected) => ({
    type: SET_CONNECTED,
    payload: isConnected,
});

export const setWalletAddress = (address) => ({
    type: SET_WALLET_ADDRESS,
    payload: address,
});

export const setIsModerator = (isModerator) => ({
    type: SET_IS_MODERATOR,
    payload: isModerator,
});

export const setModeratorAddress = (moderatorAddress) => ({
    type: SET_MODERATOR_ADDRESS,
    payload: moderatorAddress,
});

export const setIsLoading = (loading) => ({
    type: SET_IS_LOADING,
    payload: loading,
});
