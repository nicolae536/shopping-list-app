import {createAppContainer, Header} from 'react-navigation';
import {RootStackNavigator} from './navigation-stacks';

export const AppNavigation = createAppContainer(RootStackNavigator);

export const KEYBOARD_AVOID_VIEW_OFFSET = Header.HEIGHT + 24;
