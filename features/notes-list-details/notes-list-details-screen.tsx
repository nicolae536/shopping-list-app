import {Button, Form, Input, Item, Label, Text, View} from 'native-base';
import * as React from 'react';
import {KeyboardAvoidingView, ScrollView} from 'react-native';
import {NavigationInjectedProps} from 'react-navigation';
import {getTextValue, NotesListItemDetailsAddEdit} from '../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {appState} from '../../domain/state-container';
import {KEYBOARD_AVOID_VIEW_OFFSET} from '../navigation/app-navigation';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {NotesListDetailsScreenStyle} from './notes-list-detils-screen.style';

interface NotesListDetailsScreenState {
  saveActionLabel: string;
  notesListTitle: string;
  activeItem: NotesList;
}

export class NotesListDetailsScreen extends React.Component<NavigationInjectedProps, NotesListDetailsScreenState> {
  static navigationOptions = getNavigationOptions('Edit');

  constructor(props, state) {
    super(props, state);

    const {navigation} = this.props;
    const translations = appState.getTranslations();
    const activeItem = appState.findNotesList(navigation.getParam('id'));

    this.state = {
      notesListTitle: translations.NOTES_LIST_ITEM.TITLE,
      saveActionLabel: translations.NOTES_LIST_ITEM.SAVE_ACTION,
      activeItem: activeItem ? activeItem : new NotesList(),
    };
  }

  render() {
    return <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={KEYBOARD_AVOID_VIEW_OFFSET} enabled={true}
                                 style={NotesListDetailsScreenStyle.MainContainer}>
      <ScrollView>
        <Form>
          <Item floatingLabel>
            <Label>{this.state.notesListTitle}</Label>
            <Input value={this.state.activeItem.title} onChange={event => this.updateTitle(event)}/>
          </Item>
        </Form>
        {this.state.activeItem.items.map((it, idx) => <NotesListItemDetailsAddEdit
          checked={it.isDone}
          textValue={it.description}
          onCheckboxChange={checked => this.updateNoteChecked(it, checked)}
          onTextChange={newText => this.updateNoteText(it, newText)}
          key={it.uuid}/>)
        }
      </ScrollView>
      <View style={NotesListDetailsScreenStyle.BottomView}>
        <Button
          onPress={() => this.saveNotesListData()}
          style={NotesListDetailsScreenStyle.ButtonBottom}><Text>{this.state.saveActionLabel}</Text></Button>
      </View>
    </KeyboardAvoidingView>;
  }

  componentWillUnmount(): void {
    // appState.updateOrPushItem(this.state.activeItem);
  }

  // private updateItem(idx: number, newValue: NoteItem) {
  //   this.state.activeItem.items[idx] = newValue;
  //   this.state.activeItem.items.push(new NoteItem());
  //
  //   this.setState({
  //     activeItem: this.state.activeItem.clone()
  //   });
  // }

  private updateTitle(event: any) {
    event = getTextValue(event);
    this.state.activeItem.title = event;

    this.setState({
      activeItem: this.state.activeItem
    });
  }

  private updateNoteChecked(it: NoteItem, checked: boolean) {
    it.isDone = checked;

    this.sortActiveItem();

    this.setState({
      activeItem: this.state.activeItem
    });
  }

  private sortActiveItem() {
    this.state.activeItem.items.sort((a, b) => {
      if (a.isDone) {
        return 1;
      }

      if (b.isDone) {
        return -1;
      }

      return 0;
    });
  }

  private updateNoteText(it: NoteItem, newText: string) {
    it.description = newText;
    this.setState({
      activeItem: this.state.activeItem
    });
  }

  private saveNotesListData() {
    appState.updateOrPushItem(this.state.activeItem);
  }
}
