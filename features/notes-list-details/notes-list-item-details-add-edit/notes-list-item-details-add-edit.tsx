// import {} from 'react-native-vector-icons/dist/lib';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {Button, CheckBox, Form, Input, ListItem, View} from 'native-base';
import * as React from 'react';
import {Dimensions, TouchableWithoutFeedback, GestureResponderEvent} from 'react-native';
import {SwipeActions} from '../../../components/swipe-to-remove/swipe-actions';
import {NATIVE_BASE_THEME} from '../../../styles/variables';
import {NotesListItemDetailsAddEditStyle} from './notes-list-item-details-add-edit.style';

interface INotesListItemDetailsProps {
    textPlaceholder?: string;
    textValue: string;
    checked: boolean;
    canRemove: boolean;
    canDrag?: boolean;
    canToggleChecked?: boolean;
    onCheckboxChange?: (value: boolean) => void;
    onTextChange?: (value: string) => void;
    onTextFocus?: () => void;
    onTextBlur?: () => void;
    onRemove?: () => void;
    onLongPress?: (event: GestureResponderEvent) => void;
    onPressOut?: () => void;
}

interface INotesListItemDetailsState {
    text: string;
    checked: boolean;
}

export function getTextValue(event) {
    return event.nativeEvent.text;
}

export class NotesListItemDetailsAddEdit extends React.Component<INotesListItemDetailsProps, INotesListItemDetailsState> {
    elementWidth = Dimensions.get('window').width;

    constructor(props, state) {
        super(props, state);
    }

    render() {
        return <SwipeActions elementWidth={this.elementWidth}
                             elementBackgroundColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             elementSwipingBackgroundColor={NATIVE_BASE_THEME.variables.brandDanger}
                             actionIcon={'delete'}
                             enableSwipe={this.props.canRemove}
                             actionIconColor={NATIVE_BASE_THEME.variables.cardDefaultBg}
                             onSwipeEnd={() => this.onRemove()}>
            <ListItem style={NotesListItemDetailsAddEditStyle.LIST_ITEM}>
                <Form style={NotesListItemDetailsAddEditStyle.MAIN_CONTAINER}>
                    <Button transparent
                            disabled={!this.props.canToggleChecked}
                            style={NotesListItemDetailsAddEditStyle.BUTTON_STYLE}
                            onPress={() => this.checkboxToggle(null)}>
                        <CheckBox style={{
                            ...NotesListItemDetailsAddEditStyle.CHECK_BOX,
                            opacity: this.props.canToggleChecked ? 1 : 0
                        }}
                                  disabled={!this.props.canToggleChecked}
                                  onPress={(event) => this.checkboxToggle(event)}
                                  checked={this.props.checked}/>
                    </Button>
                    <Input onChange={(event) => this.textInputChange(getTextValue(event))}
                           onFocus={() => this.onFocus()}
                           style={NotesListItemDetailsAddEditStyle.INPUT}
                           onBlur={() => this.onBlur()}
                           placeholder={this.props.textPlaceholder || ''}
                           value={this.props.textValue}/>
                    {
                        !this.props.canDrag
                            ? null
                            : <View style={NotesListItemDetailsAddEditStyle.DRAG_HANDLE_CONTAINER}>
                                <TouchableWithoutFeedback style={NotesListItemDetailsAddEditStyle.DRAG_HANDLE}
                                                          delayLongPress={100}
                                                          onLongPress={(event) => this.handleLongPress(event)}
                                                          onPressOut={() => this.handlePressOut()}>
                                    <MaterialCommunityIcons style={NotesListItemDetailsAddEditStyle.DRAG_HANDLE_ICON} size={32}
                                                            name={'arrow-split-horizontal'}/>
                                </TouchableWithoutFeedback>
                            </View>
                    }
                </Form>
            </ListItem>
        </SwipeActions>;
    }

    private textInputChange(event: string) {
        if (this.props.onTextChange) {
            this.props.onTextChange(event);
        }
    }

    private checkboxToggle(event: GestureResponderEvent) {
        if (event) {
            event.stopPropagation();
        }
        if (this.props.onCheckboxChange) {
            this.props.onCheckboxChange(!this.props.checked);
        }
    }

    private onFocus() {
        if (this.props.onTextFocus) {
            this.props.onTextFocus();
        }
    }

    private onBlur() {
        if (this.props.onTextBlur) {
            this.props.onTextBlur();
        }
    }

    private onRemove() {
        if (this.props.onRemove) {
            this.props.onRemove();
        }
    }

    private handleLongPress(event: GestureResponderEvent) {
        if (this.props.onLongPress) {
            this.props.onLongPress(event);
        }
    }

    private handlePressOut() {
        if (this.props.onPressOut) {
            this.props.onPressOut();
        }
    }
}
