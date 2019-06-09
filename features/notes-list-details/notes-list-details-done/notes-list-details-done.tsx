import {ListItem, Text, View} from 'native-base';
import React, {Component} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {loggerInstance} from '../../../components/logger';
import {NotesListItemDetailsAddEdit} from '../../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NotesList} from '../../../domain/notes-list';
import {stateContainer} from '../../../domain/state-container';
import {notesListDetailsSelectors} from '../notes-list-details-selectors';
import {notesListDetailsUpdate} from '../notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from '../notes-list-detils-screen.style';

interface INotesListDetailsDoneProps {
}

interface INotesListDetailsDoneState {
    isKeyboardOpen: boolean;
    notDoneListTitle: string;
    activeItem?: NotesList;
}

export class NotesListDetailsDone extends Component<INotesListDetailsDoneProps, INotesListDetailsDoneState> {
    private onUnMount: Subject<any> = new Subject();

    constructor(props, state) {
        super(props, state);

        const translations = stateContainer.getTranslations();

        this.state = {
            isKeyboardOpen: false,
            notDoneListTitle: translations.NOTES_LIST_ITEM.NOT_DONE_TILE
        };
    }

    render() {
        return <View style={{flex: 1}}>
            <ListItem itemDivider style={NotesListDetailsScreenStyle.ListItemDivider}>
                <Text>{this.state.notDoneListTitle}</Text>
            </ListItem>
            <KeyboardAwareScrollView enableOnAndroid={true}
                                     extraScrollHeight={40}
                                     onKeyboardWillShow={() => this.setState({
                                         isKeyboardOpen: true
                                     })}
                                     onKeyboardWillHide={() => this.setState({
                                         isKeyboardOpen: false
                                     })}
                                     keyboardOpeningTime={50}>
                {
                    this.state.activeItem!.doneNoteItems
                        .map((it, idx) => <NotesListItemDetailsAddEdit
                            key={it.uuid}
                            canRemove={!this.state.isKeyboardOpen}
                            checked={it.isDone}
                            textValue={it.description}
                            onTextFocus={() => notesListDetailsUpdate.markNoteItemAsActive(it)}
                            onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(it, checked)}
                            onTextChange={newText => notesListDetailsUpdate.updateDoneNoteItemDescription(idx, newText)}
                            onRemove={() => notesListDetailsUpdate.removeItem(it)}/>)
                }
            </KeyboardAwareScrollView>
        </View>;
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

    componentWillUnmount(): void {
        this.onUnMount.next();
        this.onUnMount.complete();
    }
}