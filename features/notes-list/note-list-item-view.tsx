import {View, Text} from 'native-base';
import {PureComponent, default as React} from 'react';
import {TouchableOpacity, Dimensions} from 'react-native';
import {loggerInstance} from '../../components/logger';
import {SwipeActions} from '../../components/swipe-to-remove/swipe-actions';
import {NotesList} from '../../domain/notes-list';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {NoteListItemViewStyles} from './note-list-item-view.styles';

interface NoteListItemViewProps {
    item: NotesList,
    onTap?: () => void,
    onRemove?: () => void
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
                             elementBackgroundColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             elementSwipingBackgroundColor={NATIVE_BASE_THEME.variables.brandDanger}
                             actionIcon={'delete'}
                             actionIconColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             onSwipeEnd={() => this.handleRemove()}>
            <View style={NoteListItemViewStyles.LIST_ITEM_CARD_WRAPPER}>
                <TouchableOpacity onPress={() => this.handlePress()}
                                  style={NoteListItemViewStyles.LIST_ITEM_CARD}>
                    <View>
                        <View style={NoteListItemViewStyles.LIST_ITEM_CONTENT_TITLE}><Text>{this.props.item.title}</Text></View>
                        <View style={NoteListItemViewStyles.LIST_ITEM_CONTENT_CHILD}>
                            {
                                this.props.item.noteItems.map(it => <Text style={NoteListItemViewStyles.LIST_ITEM_CONTENT_CHILD_ITEM}
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
}