import {Container, Content, Fab, Icon, Text} from 'native-base';
import * as React from 'react';
import {ScrollView, PanResponderInstance, PanResponder} from 'react-native';
import {NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {loggerInstance} from '../../components/logger';
import {NotesList} from '../../domain/notes-list';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {NoteListItemView} from './note-list-item-view';
import {notesListSelectors} from './notes-list-selectors';
import {notesListUpdaters} from './notes-list-updaters';

interface IAppState {
    loading: boolean;
    notesList: NotesList[];
}

export default class NotesListScreen extends React.Component<NavigationInjectedProps, IAppState> {
    static navigationOptions = getNavigationOptions('Notes lists');
    componentUnmounted = new Subject();
    private _panResponder: PanResponderInstance;

    constructor(props: any, state: IAppState) {
        super(props, state);
        this.state = {
            loading: true,
            notesList: []
        };


        loggerInstance.activateLogger('components.NotesListScreen._panResponder');
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (ev, gesture) => true,
            onPanResponderMove: (ev, gesture) => {
                loggerInstance.log('components.NotesListScreen._panResponder', ev, gesture);
            }
        });
    }

    render() {
        const {navigate} = this.props.navigation;

        if (this.state.loading) {
            return <Container><Text>Loading</Text></Container>;
        }

        return (
            <Container>
                <Content>
                    <ScrollView>
                        {this.state.notesList.map(it => {
                            return <NoteListItemView item={it}
                                                     key={it.uuid}
                                                     onRemove={() => notesListUpdaters.removeItem(it)}
                                                     onTap={() => navigate('ItemDetails', {id: it.uuid})}/>;
                        })}
                    </ScrollView>
                </Content>
                <Fab
                    active={true}
                    direction="up"
                    containerStyle={{}}
                    style={{backgroundColor: NATIVE_BASE_THEME.variables.brandPrimary}}
                    position="bottomRight"
                    onPress={() => navigate('ItemDetails', {id: 'new'})}>
                    <Icon name="add"/>
                </Fab>
            </Container>
        );
    }

    componentDidMount(): void {
        notesListSelectors.notesListView$()
            .pipe(takeUntil(this.componentUnmounted))
            .subscribe(notes => {
                console.log('notes', notes);
                this.setState({
                    loading: false,
                    notesList: notes
                });
            });
    }

    componentWillUnmount(): void {
        this.componentUnmounted.next();
        this.componentUnmounted.complete();
    }
}
