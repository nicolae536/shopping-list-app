import {MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import React from 'react';
import {createAppContainer, createBottomTabNavigator} from 'react-navigation';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {NotesListDetailsDone} from './notes-list-details-done/notes-list-details-done';
import {NotesListDetailsNotDone} from './notes-list-details-not-done/notes-list-details-not-done';

export const NavigatorConfig = createBottomTabNavigator({
    NotesListDetailsNotDone: {screen: NotesListDetailsNotDone},
    NotesListDetailsDone: {screen: NotesListDetailsDone}
}, {
    defaultNavigationOptions: ({navigation}) => ({
        tabBarIcon: ({focused, horizontal, tintColor}) => {
            const {routeName} = navigation.state;
            let IconComponent = MaterialCommunityIcons;
            let iconName = `format-list-checkbox`;

            if (routeName === 'NotesListDetailsDone') {
                iconName = `checklist`;
                IconComponent = Octicons;
            }

            // You can return any component that you like here!
            return <IconComponent name={iconName} size={32} color={tintColor}/>;
        }
    }),
    tabBarOptions: {
        showLabel: false,
        activeTintColor:  NATIVE_BASE_THEME.variables.badgeColor,
        activeBackgroundColor:  NATIVE_BASE_THEME.variables.brandPrimary,
        inactiveBackgroundColor: NATIVE_BASE_THEME.variables.brandPrimary,
        inactiveTintColor: 'gray',
    }
});
export const NotesListDetailsRouter = createAppContainer(NavigatorConfig);