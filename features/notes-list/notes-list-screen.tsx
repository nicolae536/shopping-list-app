import {Container, Fab, Icon, Text} from 'native-base';
import * as React from 'react';
import {PanResponderInstance, PanResponder} from 'react-native';
import {NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DraggableKeyboardAwareFlatList} from '../../components/draggable-keyboard-aware-flatlist/draggable-keyboard-aware-flat-list';
import {loggerInstance} from '../../components/logger';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {NoteListItemView} from './note-list-item-view';
import {notesListSelectors, ViewNoteItem} from './notes-list-selectors';
import {notesListUpdaters} from './notes-list-updaters';

interface IAppState {
    loading: boolean;
    notesList: ViewNoteItem[];
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
                <DraggableKeyboardAwareFlatList onItemsDropped={(items) => {
                    notesListUpdaters.updateItemsOrder(items);
                }}
                                                style={{flex: 1}}
                                                enableOnAndroid={true}
                                                keyExtractor={(item) => item.noteItemRef.uuid}
                                                getItemLayout={(
                                                    data: any,
                                                    index: number
                                                ) => {
                                                    return {length: 89, offset: 89 * index, index: index};
                                                }}
                                                renderItem={({item, index, dragStart}) => {
                                                    return <NoteListItemView item={item}
                                                                             key={item.uuid}
                                                                             onLongPress={dragStart}
                                                                             onRemove={() => notesListUpdaters.removeItem(item)}
                                                                             onTap={() => navigate('ItemDetails', {id: item.uuid})}/>;
                                                }}
                                                data={this.state.notesList}/>
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
