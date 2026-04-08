import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const PRODUCT_CARD_WIDTH = (width - 48) / 2;
