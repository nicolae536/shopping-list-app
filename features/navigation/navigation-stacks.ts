import {createAppContainer, createStackNavigator} from 'react-navigation';
import {NotesListDetailsScreen} from '../notes-list-details/notes-list-details-screen';
import NotesListScreen from '../notes-list/notes-list-screen';

export const RootStackNavigator = createStackNavigator({
  NotesListScreen: {screen: NotesListScreen},
  ItemDetails: {screen: NotesListDetailsScreen}
}, {
  initialRouteKey: 'NotesListScreen'
});



const AppNavigator = createAppContainer(RootStackNavigator);
