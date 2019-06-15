import * as Font from 'expo-font';
import {StyleProvider} from 'native-base';
import React, {Component} from 'react';
import {AppNavigation} from './features/navigation/app-navigation';
import {NATIVE_BASE_THEME} from './styles/variables';

export default class App extends Component<any, { fontLoaded: boolean }> {
  constructor(props) {
    super(props);
    this.state = {
      fontLoaded: false
    };
  }


  async componentDidMount() {
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf')
    });

    this.setState({
      fontLoaded: true
    });
  }

  render() {
    if (!this.state.fontLoaded) {
      return null;
    }

    return (<StyleProvider style={NATIVE_BASE_THEME}>
      <AppNavigation/>
    </StyleProvider>);
  }
}
