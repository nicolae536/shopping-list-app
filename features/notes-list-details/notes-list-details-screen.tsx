import {Text, View, Form, Item, Label, Input, ListItem, List, Container, Footer, FooterTab, Button} from 'native-base';
import * as React from 'react';
import {Component} from 'react';
import {EmitterSubscription, ScrollView, Keyboard, KeyboardAvoidingView} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {loggerInstance} from '../../components/logger';
import {
    getTextValue, NotesListItemDetailsAddEdit
} from '../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {KEYBOARD_AVOID_VIEW_OFFSET} from '../navigation/navigation-consts';
import {notesListDetailsSelectors} from './notes-list-details-selectors';
import {notesListDetailsUpdate} from './notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from './notes-list-detils-screen.style';

interface NotesListDetailsScreenState {
    selectedView: 'not-done' | 'done';
    saveActionLabel: string;
    notesListTitle: string;
    activeItem?: NotesList;
    isKeyboardOpen: boolean;
}

export class NotesListDetailsScreen extends Component<NavigationInjectedProps, NotesListDetailsScreenState> {
    static navigationOptions = getNavigationOptions('Edit');
    onUnMount: Subject<any> = new Subject();
    // @ts-ignore
    private keyboardDidShowListener: EmitterSubscription;
    // @ts-ignore
    private keyboardDidHideListener: EmitterSubscription;

    constructor(props, state) {
        super(props, state);

        const {navigation} = this.props;
        const translations = stateContainer.getTranslations();

        this.state = {
            selectedView: 'not-done',
            isKeyboardOpen: false,
            notesListTitle: translations.NOTES_LIST_ITEM.TITLE,
            saveActionLabel: translations.NOTES_LIST_ITEM.SAVE_ACTION
        };
        notesListDetailsUpdate.activateOrCreateItem(navigation.getParam('id'));
    }

    render() {
        if (!this.state.activeItem) {
            return <Text>Loading...</Text>;
        }

        return <Container>
            <View style={{flex: 1}}>
                {this.renderActiveTab()}
            </View>
            <Footer>
                <FooterTab>
                    <Button active={this.state.selectedView === 'not-done'} onPress={() => this.setState({
                        selectedView: 'not-done'
                    })}>
                        <Text>Not Done</Text>
                    </Button>
                    <Button active={this.state.selectedView === 'done'} onPress={() => this.setState({
                        selectedView: 'done'
                    })}>
                        <Text>Done</Text>
                    </Button>
                </FooterTab>
            </Footer>
        </Container>;
    }

    componentWillUnmount(): void {
        this.onUnMount.next();
        this.onUnMount.complete();
        notesListDetailsUpdate.cleanState();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
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

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );
    }

    private renderTab1 = () => {
        return <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={KEYBOARD_AVOID_VIEW_OFFSET}
                                     enabled={true}
                                     style={NotesListDetailsScreenStyle.MainContainer}>
            <Form style={NotesListDetailsScreenStyle.TitleContainer}>
                <Item floatingLabel>
                    <Label style={NotesListDetailsScreenStyle.Title}>{this.state.notesListTitle}</Label>
                    <Input value={this.state.activeItem!.title}
                           style={NotesListDetailsScreenStyle.Title}
                           onChange={event => notesListDetailsUpdate.updateTitle(getTextValue(event))}/>
                </Item>
            </Form>

            <ListItem itemDivider style={NotesListDetailsScreenStyle.ListItemDivider}>
                <Text>{'Not Done Items'}</Text>
            </ListItem>

            <DraggableFlatList data={this.state.activeItem!.noteItems}
                               style={{flex: 1}}
                               keyExtractor={(item) => item.uuid}
                               scrollPercent={5}
                               renderItem={({item, index, move, moveEnd, isActive}) =>
                                   <NotesListItemDetailsAddEdit key={item.uuid}
                                                                canRemove={!item.isEmpty && !this.state.isKeyboardOpen}
                                                                checked={item.isDone}
                                                                textValue={item.description}
                                                                onTextFocus={() => notesListDetailsUpdate.setActiveNodeItem(item)}
                                                                onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(item, checked)}
                                                                onTextChange={newText => notesListDetailsUpdate.updateNoteItemDescription(index, newText)}
                                                                onLongPress={move}
                                                                onPressOut={moveEnd}
                                                                onRemove={() => notesListDetailsUpdate.removeItem(item)}/>}
            />
        </KeyboardAvoidingView>;
    };

    private renderTab2 = () => {
        return <ScrollView>
            <ListItem itemDivider style={NotesListDetailsScreenStyle.ListItemDivider}>
                <Text>{'Done Items'}</Text>
            </ListItem>
            <List>
                {
                    this.state.activeItem!.doneNoteItems
                        .map((it, idx) => <NotesListItemDetailsAddEdit
                            key={it.uuid}
                            canRemove={!this.state.isKeyboardOpen}
                            checked={it.isDone}
                            textValue={it.description}
                            onTextFocus={() => notesListDetailsUpdate.setActiveNodeItem(it)}
                            onCheckboxChange={checked => notesListDetailsUpdate.updateNoteItemIsDone(it, checked)}
                            onTextChange={newText => notesListDetailsUpdate.updateNoteItemDescription(idx, newText)}
                            onRemove={() => notesListDetailsUpdate.removeItem(it)}/>)
                }
            </List>
        </ScrollView>;
    };

    private renderActiveTab = () => {
        if (this.state.selectedView === 'not-done') {
            return this.renderTab1();
        }

        return this.renderTab2();
    };

    private _keyboardDidShow() {
        this.setState({
            isKeyboardOpen: true
        });
    }

    private _keyboardDidHide() {
        this.setState({
            isKeyboardOpen: false
        });
    }
}
