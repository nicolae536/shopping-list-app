// import {} from 'react-native-vector-icons/dist/lib';
import {MaterialIcons} from '@expo/vector-icons';
import {CheckBox, Form, Input, Button} from 'native-base';
import * as React from 'react';
import {NotesListItemDetailsAddEditStyle} from './notes-list-item-details-add-edit.style';

interface INotesListItemDetailsProps {
    textPlaceholder?: string;
    textValue: string;
    checked: boolean;
    onCheckboxChange?: (value: boolean) => void;
    onTextChange?: (value: string) => void;
    onTextFocus?: () => void;
    onTextBlur?: () => void;
    onRemove?: () => void;
}

interface INotesListItemDetailsState {
    text: string;
    checked: boolean;
}

export function getTextValue(event) {
    return event.nativeEvent.text;
}

export class NotesListItemDetailsAddEdit extends React.Component<INotesListItemDetailsProps, INotesListItemDetailsState> {

    constructor(props, state) {
        super(props, state);
    }

    render() {
        return <Form style={NotesListItemDetailsAddEditStyle.MAIN_CONTAINER}>
            <Button transparent style={NotesListItemDetailsAddEditStyle.BUTTON_STYLE}>
                <CheckBox style={NotesListItemDetailsAddEditStyle.CHECK_BOX} checked={this.props.checked}
                          onPress={() => this.checkboxToggle()}/>
            </Button>
            {/*<Button transparent style={NotesListItemDetailsAddEditStyle.BUTTON_STYLE}>*/}
            {/*    <MaterialIcons size={16} name={'drag-handle'}/>*/}
            {/*</Button>*/}
            <Input onChange={(event) => this.textInputChange(getTextValue(event))}
                   onFocus={() => this.onFocus()}
                   style={NotesListItemDetailsAddEditStyle.INPUT}
                   onBlur={() => this.onBlur()}
                   placeholder={this.props.textPlaceholder || ''}
                   value={this.props.textValue}/>
            <Button transparent style={NotesListItemDetailsAddEditStyle.BUTTON_STYLE} onPress={() => this.onRemove()}>
                <MaterialIcons size={16} name={'clear'}/>
            </Button>
        </Form>;
    }

    private textInputChange(event: string) {
        if (this.props.onTextChange) {
            this.props.onTextChange(event);
        }
    }

    private checkboxToggle() {
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
}
