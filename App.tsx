import * as Font from 'expo-font';
import {StyleProvider} from 'native-base';
import React, {useEffect} from 'react';
import {AppNavigation} from './features/navigation/app-navigation';
import {NATIVE_BASE_THEME} from './styles/variables';

export default function App() {
    useEffect(() => {
        Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf')
        });
    });

    return (<StyleProvider style={NATIVE_BASE_THEME}>
        <AppNavigation/>
    </StyleProvider>);
}