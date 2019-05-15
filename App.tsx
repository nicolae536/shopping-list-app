import * as Expo from 'expo';
import {StyleProvider} from 'native-base';
import * as React from 'react';
import {createStackNavigator, createAppContainer, NavigationAction, NavigationState} from 'react-navigation';
import NotesListScreen from './app/notes-list/notes-list-screen';
import {NotesListDetilsScreen} from './app/notes-list-details/notes-list-detils-screen';
import {STYLES} from './styles/variables';

const MainNavigator = createStackNavigator({
    HomeScreen: {screen: NotesListScreen},
    ItemDetails: {screen: NotesListDetilsScreen}
}, {
    initialRouteKey: 'NotesListScreen',
});

const AppNavigator = createAppContainer(MainNavigator);

export default class App extends React.Component<any, { loading: boolean }> {
    private navigator: any;

    someEvent() {
        // call navigate for AppNavigator here:
        // this.navigator &&
        // this.navigator.dispatch(
        //     NavigationActions.navigate({ routeName: someRouteName })
        // );
    }

    constructor(props, state) {
        super(props, state);

        this.state = {
            loading: true
        };
    }

    render() {
        return <StyleProvider style={STYLES.materialTheme}>
            <AppNavigator ref={nav => {
                this.navigator = nav;
            }} onNavigationStateChange={(prevState, newState, action) => this.handleNavigationChange(prevState, newState, action)}/>
        </StyleProvider>;

    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
            'Roboto': require('native-base/Fonts/Roboto.ttf'),
            'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf')
        });
    }

    private handleNavigationChange(prevState: NavigationState, newState: NavigationState, action: NavigationAction) {
        return undefined;
    }
}
