import {Container, Content, Fab, Icon, Text, View} from 'native-base';
import * as React from 'react';
import {ScrollView, TouchableHighlight} from 'react-native';
import {NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';
import {STYLES} from '../../styles/variables';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {NotesListScreenStyle} from './notes-list-screen.style';

interface IAppState {
    loading: boolean;
    notesList: NotesList[];
}

export default class NotesListScreen extends React.Component<NavigationInjectedProps, IAppState> {
    static navigationOptions = getNavigationOptions('Notes lists');
    _onDestroy = new Subject();

    constructor(props: any, state: IAppState) {
        super(props, state);
        this.state = {
            loading: true,
            notesList: []
        };

        this.state = {
            notesList: [],
            loading: true
        };
    }

    render() {
        const materialTheme = STYLES.materialTheme;
        const {navigate} = this.props.navigation;

        if (this.state.loading) {
            return <Container><Text>Loading</Text></Container>;
        }

        return (
            <Container>
                <Content>
                    <ScrollView style={NotesListScreenStyle.LIST_CONTAINER}>
                        {this.state.notesList.map(it => {
                            return <TouchableHighlight onPress={() => navigate('ItemDetails', {id: it.uuid})}
                                                       key={it.uuid}>
                                <View style={NotesListScreenStyle.LIST_ITEM_CARD}>
                                    <View style={NotesListScreenStyle.LIST_ITEM_CONTENT_TITLE}><Text>{it.title}</Text></View>
                                    <View style={NotesListScreenStyle.LIST_ITEM_CONTENT_CHILD}>
                                        {
                                            it.notesItems.map(it => <Text style={NotesListScreenStyle.LIST_ITEM_CONTENT_CHILD_ITEM}
                                                                          note
                                                                          key={it.uuid}>
                                                {it.description}
                                            </Text>)
                                        }
                                    </View>
                                </View>
                            </TouchableHighlight>;
                        })}
                    </ScrollView>
                </Content>
                <Fab
                    active={true}
                    direction="up"
                    containerStyle={{}}
                    style={{backgroundColor: materialTheme.variables.brandPrimary}}
                    position="bottomRight"
                    onPress={() => navigate('ItemDetails', {id: 'new'})}>
                    <Icon name="add"/>
                </Fab>
            </Container>
        );
    }

    componentDidMount(): void {
        stateContainer.notesList$()
            .pipe()
            .subscribe(notes => {
                this.setState({
                    loading: false,
                    notesList: notes.map(n => {
                        const viewValue = n.swallowClone();
                        viewValue.notesItems = viewValue.notesItems.filter(v => !v.isEmpty()).splice(0, 6);
                        console.log('notes-list-screen', viewValue);
                        return viewValue;

                    })
                });
            });
    }

    componentWillUnmount(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }
}
