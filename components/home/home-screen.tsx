import {Container, Icon, Content, Fab, List, ListItem} from 'native-base';
import * as React from 'react';
import {Text} from 'react-native';
import {appState} from '../../domain/state';
import {TodoListableItem} from '../../domain/todoItem';
import {STYLES} from '../../styles/variables';

interface IAppState {
    items: TodoListableItem[];
}

export default class HomeScreen extends React.Component<any, IAppState> {
    static navigationOptions = ({navigation, navigationOptions}) => {
        const {params} = navigation.state;

        return {
            title: 'Shopping lists',
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

    _subscriptions: { unSubscribe: () => void }[] = [];

    constructor(props: any, state: IAppState) {
        super(props, state);

        this.state = {
            items: appState.items || []
        };

        this._subscriptions.push(
            appState.select(s => s.items)
                .subscribe(items => {
                    this.setState({
                        items: items || []
                    });
                })
        );
    }

    render() {
        const materialTheme = STYLES.materialTheme;
        const {navigate} = this.props.navigation;

        return (
            <Container>
                <Content>
                    <List>
                        {this.state.items.map(it => {
                            return <ListItem style={{flex: 1, flexDirection: 'row'}} key={it.uuid} onPress={() => navigate('ItemDetails', {id: it.uuid})}>
                                <Text>
                                    {it.title}
                                </Text>
                            </ListItem>
                        })}
                    </List>
                    {/*<ListView items={this.state.items}/>*/}
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

    componentWillUnmount(): void {
        this._subscriptions.forEach(v => v.unSubscribe());
    }
}
