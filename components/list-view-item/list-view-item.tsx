import {Card, CardItem, Body, Icon} from 'native-base';
import * as React from 'react';
import {Text} from 'react-native';

interface IProps {
    isDone: boolean;
    title: string;
    uuid: string;
    navigation?: any;
    onToggle?: (item: IProps) => void;
}

export class ListViewItem extends React.Component<IProps, {}> {
    constructor(props, state) {
        super(props, state);
    }

    render() {
        return (
            <Card>
                <CardItem onPress={() => this.renderScene()}>
                    <Body style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{flex: 1}}>
                        {this.props.title}
                    </Text>
                    <Icon name="md-phone-landscape" fontSize={30}/>
                    </Body>
                </CardItem>
            </Card>
        );
    }

    renderScene() {
        const {navigate} = this.props.navigation;
        console.log(navigate);
        navigate('ItemDetails', {id: this.props.uuid});
    }
}
