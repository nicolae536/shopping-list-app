import {CheckBox, Form, Input, Item} from 'native-base';
import * as React from 'react';
// import {} from 'react-native-vector-icons/dist/lib';
import { Ionicons } from '@expo/vector-icons';

interface INotesListItemDetailsProps {
  textPlaceholder?: string;
  textValue: string;
  checked: boolean;
  onCheckboxChange?: (value: boolean) => void;
  onTextChange?: (value: string) => void;
  onTextFocus?: () => void;
  onTextBlur?: () => void;
}

interface INotesListItemDetailsState {
  text: string;
  checked: boolean;
}

export function getTextValue(event) {
  return event.nativeEvent.text
}

export class NotesListItemDetailsAddEdit extends React.Component<INotesListItemDetailsProps, INotesListItemDetailsState> {
  constructor(props, state) {
    super(props, state);

    this.state = {
      text: this.props.textValue,
      checked: this.props.checked
    };
  }

  render() {
    return <Form style={{flexDirection: 'row', alignItems: 'center'}}>
      <CheckBox checked={this.state.checked} onPress={() => this.checkboxToggle()}/>
      <Item style={{flex: 1}}>
        <Input onChange={(event) => this.textInputChange(getTextValue(event))}
               onFocus={() => this.onFocus()}
               onBlur={() => this.onBlur()}
               placeholder={this.props.textPlaceholder || ''}
               value={this.state.text}/>
      </Item>
      <Ionicons name={'clear'}/>
    </Form>;
  }

  private textInputChange(event: string) {
    if (this.props.onTextChange) {
      this.props.onTextChange(event);
    }
    this.setState({
      text: event
    });
  }

  private checkboxToggle() {
    if (this.props.onCheckboxChange) {
      this.props.onCheckboxChange(!this.state.checked);
    }
    this.setState({
      checked: !this.state.checked
    });
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
}
