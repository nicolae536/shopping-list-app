import {StyleSheet} from 'react-native';
import {NATIVE_BASE_THEME} from '../../styles/variables';

export const NoteListItemViewStyles = StyleSheet.create({
    LIST_ITEM_CONTENT_CHILD_ITEM: {
        flex: 0,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        flexBasis: '33%'
    },

    LIST_ITEM_CONTENT_CHILD: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    LIST_ITEM_CARD_WRAPPER: {
        paddingLeft: 15,
        paddingRight: 15,
    },
    LIST_ITEM_CARD: {
        flexDirection: 'column',
        flex: 1,
        borderBottomColor: '#bbb',
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    LIST_ITEM_CONTENT_TITLE: {
        paddingTop: 7,
        paddingBottom: 2
    },
});