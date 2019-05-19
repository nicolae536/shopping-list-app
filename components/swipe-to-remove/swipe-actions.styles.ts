import {StyleSheet} from 'react-native';

export const SwipeActionsStyles = StyleSheet.create({
    MAIN_CONTAINER: {
        position: 'relative',
        overflow: 'hidden',
        width: '100%'
    },
    DRAGGABLE_BACKGROUND: {
        top: 0,
        left: 0,
        paddingLeft: 20,
        paddingRight: 20,
        right: 0,
        bottom: 0,
        position: 'absolute'
    },
    DRAGGABLE_BACKGROUND_CONTENT: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});