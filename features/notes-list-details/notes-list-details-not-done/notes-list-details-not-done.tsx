import {View, ListItem, Text} from 'native-base';
import React, {Component} from 'react';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DraggableKeyboardAwareFlatlist} from '../../../components/draggable-keyboard-aware-flatlist/draggable-keyboard-aware-flatlist';
import {loggerInstance} from '../../../components/logger';
import {NotesListItemDetailsAddEdit} from '../../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NotesList} from '../../../domain/notes-list';
import {stateContainer} from '../../../domain/state-container';
import {notesListDetailsSelectors} from '../notes-list-details-selectors';
import {notesListDetailsUpdate} from '../notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from '../notes-list-detils-screen.style';

interface INotesListDetailsNotDoneProps {
}

interface INotesListDetailsNotDoneState {
    isKeyboardOpen: boolean;
    notDoneListTitle: string;
    addNewItemPlaceholder: string;
    activeItem?: NotesList;
}

export class NotesListDetailsNotDone extends Component<INotesListDetailsNotDoneProps, INotesListDetailsNotDoneState> {
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

            <DraggableKeyboardAwareFlatlist data={this.state.activeItem!.noteItems}
                                            style={{flex: 1}}
                                            enableOnAndroid={true}
                                            extraScrollHeight={40}
                                            onKeyboardWillShow={() => this.setState({
                                                isKeyboardOpen: true
                                            })}
                                            onKeyboardWillHide={() => this.setState({
                                                isKeyboardOpen: false
                                            })}
                                            keyboardOpeningTime={50}
                                            keyExtractor={(item) => item.uuid}
                                            onItemsDropped={(list) => notesListDetailsUpdate.updateNotesListOrder(list)}
                                            renderItem={({item, index, dragStart}) => {
                                                return <NotesListItemDetailsAddEdit key={item.uuid}
                                                                                    canRemove={!item.isEmpty && !this.state.isKeyboardOpen}
                                                                                    checked={item.isDone}
                                                                                    textPlaceholder={item.isEmpty
                                                                                        ? this.state.addNewItemPlaceholder
                                                                                        : ''}
                                                                                    textValue={item.description}
                                                                                    onTextFocus={() => notesListDetailsUpdate.markNoteItemAsActive(item)}
                                                                                    onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(item, checked)}
                                                                                    onTextChange={newText => notesListDetailsUpdate.updateNotDoneNoteItemDescription(index, newText)}
                                                                                    onRemove={() => notesListDetailsUpdate.removeItem(item)}
                                                                                    onLongPress={(ev) => dragStart(ev)}/>;
                                            }
                                            }/>
        </View>;
    }

    componentWillUnmount(): void {
        this.onUnMount.next();
        this.onUnMount.complete();
    }
}
