import {StyleSheet, Platform} from 'react-native';
import {NATIVE_BASE_THEME} from '../../styles/variables';

export const NotesListDetailsScreenStyle = StyleSheet.create({
    MainContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingTop: (Platform.OS === 'ios') ? 20 : 0,
        marginBottom: 10
    },

    InnerView: {
        flex: 1,
        flexDirection: 'column'
    },

    BottomView: {
        width: '100%',
        padding: 10
    },

    ButtonBottom: {
        width: '100%'
    },
    Title: {
        fontSize: 20,
        marginBottom: 5
    },
    ListItemDivider: {marginTop: 10},
    ListStyle: {flex: 1},
    TitleContainer: {marginBottom: 10},
    TabIconStyle: {
        color: NATIVE_BASE_THEME.variables.cardDefaultBg
    },
});