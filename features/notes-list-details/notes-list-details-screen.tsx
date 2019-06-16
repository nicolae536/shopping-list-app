import {Container, Form, Input, Item, Label, Text, View} from 'native-base';
import React, {Component} from 'react';
import {NavigationContainerComponent, NavigationInjectedProps} from 'react-navigation';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {loggerInstance} from '../../components/logger';
import {getTextValue} from '../../components/notes-list-item-details-add-edit/notes-list-item-details-add-edit';
import {NotesList} from '../../domain/notes-list';
import {stateContainer} from '../../domain/state-container';
import {getNavigationOptions} from '../navigation/app-navigation-header';
import {NotesListDetailsRouter} from './notes-list-details-router';
import {notesListDetailsSelectors} from './notes-list-details-selectors';
import {notesListDetailsUpdate} from './notes-list-details-updaters';
import {NotesListDetailsScreenStyle} from './notes-list-detils-screen.style';

interface NotesListDetailsScreenState {
  selectedView: string;
  notesListTitle: string;
  activeItem?: NotesList;
  isKeyboardOpen: boolean;
}

export class NotesListDetailsScreen extends Component<NavigationInjectedProps, NotesListDetailsScreenState> {
  static router = NotesListDetailsRouter.router;
  static navigationOptions = getNavigationOptions('Edit');
  onUnMount: Subject<any> = new Subject();

  private navigatorRef: NavigationContainerComponent;

  constructor(props, state) {
    super(props, state);

    const {navigation} = this.props;
    const translations = stateContainer.getTranslations();

    this.state = {
      selectedView: 'NotesListDetailsNotDone',
      isKeyboardOpen: false,
      notesListTitle: translations.NOTES_LIST_ITEM.TITLE
    };
    notesListDetailsUpdate.activateOrCreateItem(navigation.getParam('id'));
  }

  render() {
    if (!this.state.activeItem) {
      return <Text>Loading...</Text>;
    }

    const {navigation} = this.props;

    return <Container>
      <View style={{flex: 1}}>

        <Form style={NotesListDetailsScreenStyle.TitleContainer}>
          <Item floatingLabel>
            <Label style={NotesListDetailsScreenStyle.Title}>{this.state.notesListTitle}</Label>
            <Input value={this.state.activeItem!.title}
                   style={NotesListDetailsScreenStyle.Title}
                   onChange={event => notesListDetailsUpdate.updateTitle(getTextValue(event))}/>
          </Item>
        </Form>
        <NotesListDetailsRouter navigation={navigation} ref={navigatorRef => {
          this.navigatorRef = navigatorRef;
        }}/>
      </View>
    </Container>;
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
        loggerInstance.log('features.notes-list-details.NotesListDetailsScreen', 'active-item', activeItem);
        this.setState({
          activeItem: activeItem
        });
      });
  }
}
