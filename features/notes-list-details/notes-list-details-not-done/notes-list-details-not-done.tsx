import {ListItem, Text, View} from 'native-base';
import React, {Component, PureComponent} from 'react';
import {LayoutAnimation} from 'react-native';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DraggableKeyboardAwareFlatList} from '../../../components/draggable-keyboard-aware-flatlist/draggable-keyboard-aware-flat-list';
import {loggerInstance} from '../../../components/logger';
import {NotesList} from '../../../domain/notes-list';
import {stateContainer} from '../../../domain/state-container';
import {Translations} from '../../../domain/translations';
import {notesListDetailsSelectors} from '../notes-list-details-selectors';
import {notesListDetailsUpdate} from '../notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from '../notes-list-detils-screen.style';
import {NotesListItemDetailsAddEdit} from '../notes-list-item-details-add-edit/notes-list-item-details-add-edit';

interface INotesListDetailsNotDoneProps {
}

interface INotesListDetailsNotDoneState {
  isKeyboardOpen: boolean;
  notDoneListTitle: string;
  addNewItemPlaceholder: string;
  activeItem?: NotesList;
}

export class NotesListDetailsNotDone extends PureComponent<INotesListDetailsNotDoneProps, INotesListDetailsNotDoneState> {
  private onUnMount: Subject<any> = new Subject();

  constructor(props, state) {
    super(props, state);

    const translations = stateContainer.getTranslations();
    this.state = {
      isKeyboardOpen: false,
      addNewItemPlaceholder: translations.NOTES_LIST_ITEM.ADD_NEW_ITEM,
      notDoneListTitle: translations.NOTES_LIST_ITEM.NOT_DONE_TILE
    };
  }

  componentWillMount(): void {
    notesListDetailsSelectors.activeItem$()
      .pipe(takeUntil(this.onUnMount))
      .subscribe(activeItem => {
        loggerInstance.log('features.notes-list-details.NotesListDetailsScreen', 'active-item', activeItem);
        this.setState({
          activeItem: activeItem
        });
      });
  }

  render() {
    return <View style={{flex: 1}}>
      <ListItem itemDivider style={NotesListDetailsScreenStyle.ListItemDivider}>
        <Text>{this.state.notDoneListTitle}</Text>
      </ListItem>

      <DraggableKeyboardAwareFlatList data={this.state.activeItem!.noteItems}
                                      style={{flex: 1}}
                                      enableOnAndroid={true}
                                      extraScrollHeight={150}
                                      dropItemPlaceholder={Translations.en.DROP_ITEM_PLACEHOLDER}
                                      keyExtractor={(item) => item.uuid}
                                      getItemLayout={(
                                        data: any,
                                        index: number
                                      ) => {
                                        return {length: 65, offset: 65 * index, index: index};
                                      }}
                                      onItemsDropped={(list) => notesListDetailsUpdate.updateNotesListOrder(list)}
                                      renderItem={({item, index, dragStart}) => {
                                        return <NotesListItemDetailsAddEdit key={item.uuid}
                                                                            canRemove={!item.isEmpty}
                                                                            canDrag={!item.isEmpty}
                                                                            canToggleChecked={!item.isEmpty}
                                                                            checked={item.isDone}
                                                                            textPlaceholder={item.isEmpty
                                                                              ? this.state.addNewItemPlaceholder
                                                                              : ''}
                                                                            textValue={item.description}
                                                                            onTextFocus={() => notesListDetailsUpdate.markNoteItemAsActive(item)}
                                                                            onCheckboxChange={checked => this.handleCheckboxChange(item, checked)}
                                                                            onTextChange={newText => notesListDetailsUpdate.updateNotDoneNoteItemDescription(index, newText)}
                                                                            onRemove={() => this.handleRemoveItem(item)}
                                                                            onLongPress={(ev) => dragStart(ev)}/>;
                                      }
                                      }/>
    </View>;
  }

  componentWillUnmount(): void {
    this.onUnMount.next();
    this.onUnMount.complete();
  }

  private handleRemoveItem(item: any) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    notesListDetailsUpdate.removeItem(item);
  }

  private handleCheckboxChange(item: any, checked: boolean) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    notesListDetailsUpdate.updateNoteItemIsDone(item, checked);
  }
}
