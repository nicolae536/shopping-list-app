import {Form, Input, Item, Label, Text, View, List, ListItem} from 'native-base';
import * as React from 'react';
import {KeyboardAvoidingView, ScrollView} from 'react-native';
import {NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {
    getTextValue, NotesListItemDetailsAddEdit
} from '../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';
import {KEYBOARD_AVOID_VIEW_OFFSET} from '../navigation/app-navigation';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {notesListDetailsSelectors} from './notes-list-details-selectors';
import {notesListDetailsUpdate} from './notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from './notes-list-detils-screen.style';

interface NotesListDetailsScreenState {
    saveActionLabel: string;
    notesListTitle: string;
    activeItem?: NotesList;
}

export class NotesListDetailsScreen extends React.Component<NavigationInjectedProps, NotesListDetailsScreenState> {
    static navigationOptions = getNavigationOptions('Edit');
    onUnMount: Subject<any> = new Subject();

    constructor(props, state) {
        super(props, state);

        const {navigation} = this.props;
        const translations = stateContainer.getTranslations();

        this.state = {
            notesListTitle: translations.NOTES_LIST_ITEM.TITLE,
            saveActionLabel: translations.NOTES_LIST_ITEM.SAVE_ACTION
        };
        notesListDetailsUpdate.activateOrCreateItem(navigation.getParam('id'));
    }

    render() {
        return <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={KEYBOARD_AVOID_VIEW_OFFSET} enabled={true}
                                     style={NotesListDetailsScreenStyle.MainContainer}>
            <ScrollView>
                {
                    !this.state.activeItem
                        ? <Text>Loading</Text>
                        : <View>
                            <Form>
                                <Item floatingLabel>
                                    <Label>{this.state.notesListTitle}</Label>
                                    <Input value={this.state.activeItem.title}
                                           onChange={event => notesListDetailsUpdate.updateTitle(getTextValue(event))}/>
                                </Item>
                            </Form>
                            <List>
                                <ListItem itemDivider>
                                    <Text>{'Not Done Items'}</Text>
                                </ListItem>
                                {this.state.activeItem.noteItems.map((it, idx) => <NotesListItemDetailsAddEdit
                                    checked={it.isDone}
                                    textValue={it.description}
                                    onTextFocus={() => notesListDetailsUpdate.setActiveNodeItem(it)}
                                    onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(it, checked)}
                                    onTextChange={newText => notesListDetailsUpdate.updateNoteItemDescription(newText)}
                                    onRemove={() => notesListDetailsUpdate.removeItem(it)}
                                    key={it.uuid}/>)
                                }
                                <ListItem itemDivider>
                                    <Text>{'Done Items'}</Text>
                                </ListItem>
                                {
                                    this.state.activeItem.doneNoteItems
                                        .map((it, idx) => <NotesListItemDetailsAddEdit
                                            checked={it.isDone}
                                            textValue={it.description}
                                            onTextFocus={() => notesListDetailsUpdate.setActiveNodeItem(it)}
                                            onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(it, checked)}
                                            onTextChange={newText => notesListDetailsUpdate.updateNoteItemDescription(newText)}
                                            onRemove={() => notesListDetailsUpdate.removeItem(it)}
                                            key={it.uuid}/>)
                                }
                            </List>
                        </View>

                }

            </ScrollView>
        </KeyboardAvoidingView>;
    }

    componentWillUnmount(): void {
        this.onUnMount.next();
        this.onUnMount.complete();
        notesListDetailsUpdate.cleanState();
    }

    componentWillMount(): void {
        notesListDetailsSelectors.activeItem$()
            .pipe(takeUntil(this.onUnMount))
            .subscribe(activeItem => {
                console.log('active-item', activeItem);
                this.setState({
                    activeItem: activeItem
                });
            });
    }
}
