import {MaterialIcons} from '@expo/vector-icons';
import {View, Text} from 'native-base';
import {PureComponent, default as React} from 'react';
import {
    PanResponder, PanResponderInstance, TouchableOpacity, Dimensions, PanResponderGestureState, GestureResponderEvent, Animated
} from 'react-native';
import {NotesList} from '../../domain/notes-list';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {NoteListItemViewStyles} from './note-list-item-view.styles';
import {NotesListScreenStyle} from './notes-list-screen.style';

interface NoteListItemViewProps {
    item: NotesList,
    onTap?: () => void,
    onRemove?: () => void
}

interface NoteListItemViewState {
    backgroundColor: string;
    paddingLeft: number | string;
    paddingRight: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    position: Animated.ValueXY;
}

export class NoteListItemView extends PureComponent<NoteListItemViewProps, NoteListItemViewState> {
    private _panResponder: PanResponderInstance;

    constructor(props, state) {
        super(props, state);

        const position = new Animated.ValueXY();
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (e, g) => true,
            onPanResponderStart: () => this.onPanResponderStart(),
            onPanResponderMove: (ev, gesture) => this.onPanResponderMove(ev, gesture),
            onPanResponderEnd: () => this.onPanResponderEnd()
        });

        this.state = {
            backgroundColor: NATIVE_BASE_THEME.variables.cardDefaultBg,
            paddingLeft: 15,
            paddingRight: 15,
            position: position
        };
    }

    render() {
        return <View style={NoteListItemViewStyles.MAIN_CONTAINER}>
            <View style={NoteListItemViewStyles.DRAGGABLE_BACKGROUND}>
                <View style={NoteListItemViewStyles.DRAGGABLE_BACKGROUND_CONTENT}>
                    <MaterialIcons color={NATIVE_BASE_THEME.variables.cardDefaultBg} size={32} name={'delete'}/>
                    <MaterialIcons color={NATIVE_BASE_THEME.variables.cardDefaultBg} size={32} name={'delete'}/>
                </View>
            </View>
            <Animated.View style={[{
                backgroundColor: NATIVE_BASE_THEME.variables.cardDefaultBg,
                paddingLeft: 15,
                paddingRight: 15,
                minWidth: this.state.minWidth,
                maxWidth: this.state.maxWidth
            }, this.state.position.getLayout()]} {...this._panResponder.panHandlers}>
                <TouchableOpacity onPress={() => this.handlePress()}
                                  style={NotesListScreenStyle.LIST_ITEM_CARD}>
                    <View>
                        <View style={NotesListScreenStyle.LIST_ITEM_CONTENT_TITLE}><Text>{this.props.item.title}</Text></View>
                        <View style={NotesListScreenStyle.LIST_ITEM_CONTENT_CHILD}>
                            {
                                this.props.item.noteItems.map(it => <Text style={NotesListScreenStyle.LIST_ITEM_CONTENT_CHILD_ITEM}
                                                                          note
                                                                          key={it.uuid}>
                                    {it.description}
                                </Text>)
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>;
    }

    private handlePress() {
        if (this.props.onTap) {
            this.props.onTap();
        }
    }

    private onPanResponderStart() {
        this.setState({
            minWidth: Dimensions.get('window').width,
            maxWidth: Dimensions.get('window').width,
            position: new Animated.ValueXY()
        });
    }

    private onPanResponderMove(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        this.state.position.setValue({x: gesture.dx, y: 0});
    }

    private onPanResponderEnd() {
        const widthScreenWidth = Dimensions.get('window').width;
        const currentPosition = this.state.position.x['_value'];
        const wasRemoves = Math.abs(currentPosition) > widthScreenWidth / 2;
        if (!wasRemoves) {
            this.state.position.setValue({x: 0, y: 0});
            return;
        }

        this.state.position.setValue({x: currentPosition > 0 ? widthScreenWidth : -widthScreenWidth, y: 0});
        if (this.props.onRemove) {
            this.props.onRemove();
        }
    }
}