import * as React from 'react';
import {View} from 'react-native';
import {ListItem} from '../../domain/todoItem';
import {ListViewItem} from '../list-view-item/list-view-item';

interface IItemList {
    items: ListItem[]
}

export class ListView extends React.Component<IItemList, IItemList> {
    constructor(props: IItemList) {
        super(props);
    }

    render() {
        return <View>
            {this.props.items && this.props.items.length
                ? this.props.items.map(it => <ListViewItem uuid={it.uuid} isDone={it.idDone} title={it.title} key={it.uuid}/>)
                : <></>}
        </View>;
    }
}