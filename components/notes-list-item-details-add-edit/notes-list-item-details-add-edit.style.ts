import {StyleSheet} from 'react-native';

export const NotesListItemDetailsAddEditStyle = StyleSheet.create({
    MAIN_CONTAINER: {
        flexDirection: 'row', alignItems: 'center'
    },
    INPUT: {
        flex: 1,
        flexShrink: 1
    },
    BUTTON_STYLE: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
    },
    CHECK_BOX: {
        marginLeft: '-50%'
    }
});