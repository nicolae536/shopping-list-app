import {Form, Input, Item, CheckBox} from 'native-base';
import * as React from 'react';
import {NoteItem} from '../../domain/note-item';

export class NotesListItemDetailsAddEdit extends React.Component<{ item: NoteItem, onChange: (it: NoteItem) => void }, { item: NoteItem }> {
    constructor(props, state) {
        super(props, state);

        this.state = {
            item: props.item
        };
    }

    render() {
        return <Form style={{flexDirection: 'row', alignItems: 'center'}}>
            <CheckBox checked={this.state.item.isDone} onPress={() => this.updateIsDone()}/>
            <Item style={{flex: 1}}>
                <Input onChange={(event) => this.inputChange(event)}
                       onBlur={() => this.props.onChange(this.state.item)}
                       placeholder="Description" value={this.state.item.description}/>
            </Item>
        </Form>;
    }

    private inputChange(event) {
        this.state.item.description = event.nativeEvent.text;
        this.setState({
            item: this.state.item.clone()
        });
    }

    private updateIsDone() {
        this.state.item.isDone = !this.state.item.isDone;
        this.props.onChange(this.state.item.clone());
    }
}