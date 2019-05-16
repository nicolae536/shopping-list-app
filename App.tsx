import * as Expo from 'expo';
import {StyleProvider} from 'native-base';
import * as React from 'react';
import {AppNavigation} from './features/navigation/app-navigation';
import {STYLES} from './styles/variables';

export default class App extends React.Component<any, any> {
  constructor(props, state) {
    super(props, state);
  }

  render() {
    return <StyleProvider style={STYLES.materialTheme}>
      <AppNavigation/>
      {/*<AppNavigator ref={nav => {*/}
      {/*  this.navigator = nav;*/}
      {/*}} onNavigationStateChange={(prevState, newState, action) => this.handleNavigationChange(prevState, newState, action)}/>*/}
    </StyleProvider>;

  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf')
    });
  }
}
