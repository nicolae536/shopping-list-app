import {StyleSheet} from 'react-native';

export const NotesListScreenStyle = StyleSheet.create({
    LIST_CONTAINER: {
        marginLeft: 15,
        marginRight: 15
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
    LIST_ITEM_CONTENT_CHILD: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    LIST_ITEM_CONTENT_CHILD_ITEM: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        flexBasis: '33%'
    }
});