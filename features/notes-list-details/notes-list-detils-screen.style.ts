import {StyleSheet, Platform} from 'react-native';

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
        fontSize: 20
    },
    ListItemDivider: {marginTop: 10},
    TitleContainer: {marginBottom: 10}
});