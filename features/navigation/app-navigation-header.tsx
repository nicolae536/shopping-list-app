import {NavigationScreenDetails, NavigationScreenOptions} from 'react-navigation';
import {NATIVE_BASE_THEME} from '../../styles/variables';

export type NavigationOptionsParamsFn = (data: { navigation: NavigationScreenDetails<any>, navigationOptions: NavigationScreenOptions }) => string

export const getNavigationOptions = (composeTitle: string | NavigationOptionsParamsFn) => {
    return ({navigation, navigationOptions}) => {
        const {params} = navigation.state;
        return {
            title: typeof composeTitle !== 'string' ? composeTitle({navigation, navigationOptions}) : composeTitle,
            /* These values are used instead of the shared configuration! */
            headerStyle: {
                backgroundColor: NATIVE_BASE_THEME.variables.brandPrimary
            },
            headerTintColor: NATIVE_BASE_THEME.variables.brandLight,
            headerTitleStyle: {
                fontWeight: 'bold'
            }
        };
    };
};
