import {createAppContainer, Header} from 'react-navigation';
import {RootStackNavigator} from './navigation-stacks';

export const AppNavigation = createAppContainer(RootStackNavigator);

