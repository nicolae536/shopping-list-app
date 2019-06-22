import {ListItem, Text, View} from 'native-base';
import React, {Component} from 'react';
import {LayoutAnimation} from 'react-native';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DraggableKeyboardAwareFlatList} from '../../../components/draggable-keyboard-aware-flatlist/draggable-keyboard-aware-flat-list';
import {loggerInstance} from '../../../components/logger';
import {NotesList} from '../../../domain/notes-list';
import {stateContainer} from '../../../domain/state-container';
import {notesListDetailsSelectors} from '../notes-list-details-selectors';
import {notesListDetailsUpdate} from '../notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from '../notes-list-detils-screen.style';
import {NotesListItemDetailsAddEdit} from '../notes-list-item-details-add-edit/notes-list-item-details-add-edit';

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
            notDoneListTitle: translations.NOTES_LIST_ITEM.DONE_TILE
        };
    }

    render() {
        return <View style={{flex: 1}}>
            <ListItem itemDivider style={NotesListDetailsScreenStyle.ListItemDivider}>
                <Text>{this.state.notDoneListTitle}</Text>
            </ListItem>
            <DraggableKeyboardAwareFlatList data={this.state.activeItem!.doneNoteItems}
                                            style={{flex: 1}}
                                            enableOnAndroid={true}
                                            extraScrollHeight={150}
                                            keyExtractor={(item) => item.uuid}
                                            onItemsDropped={(list) => notesListDetailsUpdate.updateDoneNotesListOrder(list)}
                                            renderItem={({item, index, dragStart}) => {
                                                return <NotesListItemDetailsAddEdit
                                                    key={item.uuid}
                                                    canRemove={true}
                                                    canDrag={true}
                                                    canToggleChecked={true}
                                                    checked={item.isDone}
                                                    textValue={item.description}
                                                    onTextFocus={() => notesListDetailsUpdate.markNoteItemAsActive(item)}
                                                    onCheckboxChange={checked => this.handleCheckboxChange(item, checked)}
                                                    onTextChange={newText => notesListDetailsUpdate.updateDoneNoteItemDescription(index, newText)}
                                                    onRemove={() => this.handleRemoveItem(item)}
                                                    onLongPress={(ev) => dragStart(ev)}
                                                />;
                                            }}/>
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

    private handleRemoveItem(item: any) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        notesListDetailsUpdate.removeItem(item);
    }

    private handleCheckboxChange(item: any, checked: boolean) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        notesListDetailsUpdate.updateNoteItemIsDone(item, checked)
    }
}