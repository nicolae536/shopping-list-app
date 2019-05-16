import {NavigationContainerProps, NavigationScreenDetails, NavigationScreenOptions} from 'react-navigation';
import {STYLES} from '../../styles/variables';

export type NavigationOptionsParamsFn = (data: {navigation: NavigationScreenDetails<any>, navigationOptions: NavigationScreenOptions}) => string

export const getNavigationOptions = (composeTitle: string | NavigationOptionsParamsFn,) => {
  return ({navigation, navigationOptions}) => {
    const {params} = navigation.state;

    return {
      title: typeof composeTitle !== 'string' ? composeTitle({navigation, navigationOptions}) : composeTitle,
      /* These values are used instead of the shared configuration! */
      headerStyle: {
        backgroundColor: STYLES.materialTheme.variables.brandPrimary
      },
      headerTintColor: STYLES.materialTheme.variables.brandLight,
      headerTitleStyle: {
        fontWeight: 'bold'
      }
    };
  };
};
