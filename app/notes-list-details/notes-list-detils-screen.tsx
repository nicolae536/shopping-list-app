import {Form, Item, Input, Label, Button, Text, View} from 'native-base';
import * as React from 'react';
import {KeyboardAvoidingView, ScrollView} from 'react-native';
import {Header} from 'react-navigation';
import {NotesListItemDetailsAddEdit} from '../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NoteItem} from '../../domain/note-item';
import {NotesList} from '../../domain/notes-list';
import {appState} from '../../domain/state-container';
import {TranslationsType} from '../../domain/translations';
import {STYLES} from '../../styles/variables';
import {NotesListDetailsScreenStyle} from './notes-list-detils-screen.style';

export class NotesListDetilsScreen extends React.Component<any, { activeItem: NotesList, translations: TranslationsType }> {
    constructor(props, state) {
        super(props, state);

        const {navigation} = this.props;

        this.state = {
            translations: appState.getTranslations(),
            activeItem: navigation.getParam('id') === 'new'
                ? new NotesList()
                : appState.findNotesList(navigation.getParam('id'))
        };
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        const {params} = navigation.state;

        return {
            title: 'Edit',
            /* These values are used instead of the shared configuration! */
            headerStyle: {
                backgroundColor: STYLES.materialTheme.variables.brandPrimary
            },
            headerTintColor: STYLES.materialTheme.variables.brandLight,
            headerTitleStyle: {
                fontWeight: 'bold'
            }
        };
    };

    render() {
        const items = this.state.activeItem.items.sort((a, b) => {
            if (a.isDone) {
                return 1;
            }

            if (b.isDone) {
                return -1;
            }

            return 0;
        });

        return <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={Header.HEIGHT + 24} enabled={true}
                                     style={NotesListDetailsScreenStyle.MainContainer}>
            <ScrollView>
                <Form>
                    <Item floatingLabel>
                        <Label>{this.state.translations.NOTES_LIST_ITEM.TITLE}</Label>
                        <Input value={this.state.activeItem.title}
                               onChange={event => this.updateTitle(event)}/>
                    </Item>
                </Form>
                {items.map((it, idx) => <NotesListItemDetailsAddEdit item={it}
                                                                     onChange={(newValue) => this.updateItem(idx, newValue)}
                                                                     key={it.uuid}/>)
                }
            </ScrollView>
            <View style={NotesListDetailsScreenStyle.BottomView}>
                <Button
                    style={NotesListDetailsScreenStyle.ButtonBottom}><Text>{this.state.translations.NOTES_LIST_ITEM.SAVE_ACTION}</Text></Button>
            </View>
        </KeyboardAvoidingView>;
    }

    componentWillUnmount(): void {
        appState.updateOrPushItem(this.state.activeItem);
    }

    private updateItem(idx: number, newValue: NoteItem) {
        this.state.activeItem.items[idx] = newValue;
        this.state.activeItem.items.push(new NoteItem());

        this.setState({
            activeItem: this.state.activeItem.clone()
        });
    }

    private updateTitle(event: any) {
        this.state.activeItem.title = event.nativeEvent.text;

        this.setState({
            activeItem: this.state.activeItem.clone()
        });
    }
}