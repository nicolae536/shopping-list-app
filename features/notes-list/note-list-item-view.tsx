import {View, Text} from 'native-base';
import {PureComponent, default as React} from 'react';
import {TouchableOpacity, Dimensions, GestureResponderEvent} from 'react-native';
import {loggerInstance} from '../../components/logger';
import {SwipeActions} from '../../components/swipe-to-remove/swipe-actions';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {NoteListItemViewStyles} from './note-list-item-view.styles';
import {ViewNoteItem} from './notes-list-selectors';

interface NoteListItemViewProps {
    item: ViewNoteItem;
    onTap?: () => void;
    onRemove?: () => void;
    onLongPress?: (ev: GestureResponderEvent) => void;
}

interface NoteListItemViewState {
    elWidth: number;
}

export class NoteListItemView extends PureComponent<NoteListItemViewProps, NoteListItemViewState> {
    constructor(props, state) {
        super(props, state);
        loggerInstance.activateLogger('NoteListItemView');
        this.state = {
            elWidth: Dimensions.get('window').width
        };
    }

    render() {
        return <SwipeActions elementWidth={this.state.elWidth}
                             enableSwipe={true}
                             elementBackgroundColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             elementSwipingBackgroundColor={NATIVE_BASE_THEME.variables.brandDanger}
                             actionIcon={'delete'}
                             actionIconColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             onSwipeEnd={() => this.handleRemove()}>
            <View style={NoteListItemViewStyles.LIST_ITEM_CARD_WRAPPER}>
                <TouchableOpacity onPress={() => this.handlePress()}
                                  delayLongPress={300}
                                  onLongPress={(ev) => this.handleLongPress(ev)}
                                  style={NoteListItemViewStyles.LIST_ITEM_CARD}>
                    <View>
                        <View style={NoteListItemViewStyles.LIST_ITEM_CONTENT_TITLE}>
                            <View>
                                <Text>{this.props.item.noteItemRef.title}</Text>
                            </View>
                            <View>
                                <Text>{this.props.item.noteItemRef.created.toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <View style={NoteListItemViewStyles.LIST_ITEM_CONTENT_CHILD}>
                            {
                                this.props.item.visibleItems.map(it => <Text style={NoteListItemViewStyles.LIST_ITEM_CONTENT_CHILD_ITEM}
                                                                             numberOfLines={1}
                                                                             note
                                                                             key={it.uuid}>
                                    {it.description}
                                </Text>)
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </SwipeActions>;
    }

    private handlePress() {
        loggerInstance.log('NoteListItemView', 'onPress');
        if (this.props.onTap) {
            this.props.onTap();
        }
    }

    private handleRemove() {
        loggerInstance.log('NoteListItemView', 'onRemove');
        if (this.props.onRemove) {
            this.props.onRemove();
        }
    }

    private handleLongPress(ev) {
        if (this.props.onLongPress) {
            this.props.onLongPress(ev);
        }
    }
}
