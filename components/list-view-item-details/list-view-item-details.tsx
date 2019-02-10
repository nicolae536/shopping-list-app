import {Form, Item, Input} from 'native-base';
import * as React from 'react';
import {View} from 'react-native';
import {appState} from '../../domain/state';
import {ListItem, TodoItem} from '../../domain/todoItem';
import {STYLES} from '../../styles/variables';
import {ListViewItemAdd} from './list-view-item-add';

export class ListViewItemDetails extends React.Component<any, { activeItem: ListItem, }> {
    static navigationOptions = ({navigation, navigationOptions}) => {
        const {params} = navigation.state;

        return {
            title: 'Title',
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

    constructor(props, state) {
        super(props, state);

        const {navigation} = this.props;

        this.state = {
            activeItem: navigation.getParam('id') === 'new'
                ? new ListItem()
                : appState.findItem(navigation.getParam('id'))
        };
    }

    render() {
        return <View style={{paddingLeft: 20, paddingRight: 20}}>
            <Form>
                <Item>
                    <Input value={this.state.activeItem.title} onChange={event => this.updateTitle(event)}/>
                </Item>
            </Form>

            {this.state.activeItem.items.map((it, idx) => <ListViewItemAdd item={it}
                                                                           onChange={(newValue) => this.updateItem(idx, newValue)}
                                                                           key={it.uuid}/>)
            }
        </View>;
    }

    componentWillUnmount(): void {
        appState.updateOrPushItem(this.state.activeItem);
    }

    private updateItem(idx: number, newValue: TodoItem) {
        this.state.activeItem.items[idx] = newValue;
        this.state.activeItem.items.push(new TodoItem());

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