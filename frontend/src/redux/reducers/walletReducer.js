import { SET_CONNECTED, SET_WALLET_ADDRESS, SET_IS_MODERATOR, SET_MODERATOR_ADDRESS, SET_IS_LOADING } from '../actions/walletActions';

const initialState = {
    isConnected: false,
    walletAddress: '',
    isModerator: false,
    moderatorAddress: '',
    loading: false,
};

const walletReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CONNECTED:
            return { ...state, isConnected: action.payload };
        case SET_WALLET_ADDRESS:
            return { ...state, walletAddress: action.payload };
        case SET_IS_MODERATOR:
            return { ...state, isModerator: action.payload };
        case SET_MODERATOR_ADDRESS:
            return { ...state, moderatorAddress: action.payload };
        case SET_IS_LOADING: 
            return { ...state, loading: action.payload};
        default:
            return state;
    }
};

export default walletReducer;
