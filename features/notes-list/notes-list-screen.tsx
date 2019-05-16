import {Container, Content, Fab, Icon, List, ListItem} from 'native-base';
import * as React from 'react';
import {Text} from 'react-native';
import {NavigationScreenProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {NotesList} from '../../domain/notes-list';
import {appState} from '../../domain/state-container';
import {STYLES} from '../../styles/variables';
import {getNavigationOptions} from '../navigation/app-navigation-header';

interface IAppState {
  loading: boolean;
  notesList: NotesList[];
}

export default class NotesListScreen extends React.Component<NavigationScreenProps<any>, IAppState> {
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
          <List>
            {this.state.notesList.map(it => {
              return <ListItem style={{flex: 1, flexDirection: 'row'}}
                               key={it.uuid}
                               onPress={() => navigate('ItemDetails', {id: it.uuid})}>
                <Text>
                  {it.title}
                </Text>
              </ListItem>;
            })}
          </List>
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
    appState.notesList$()
      .pipe()
      .subscribe(notes => {
        console.log(notes);
        this.setState({
          loading: false,
          notesList: notes
        });
      });
  }

  componentWillUnmount(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
