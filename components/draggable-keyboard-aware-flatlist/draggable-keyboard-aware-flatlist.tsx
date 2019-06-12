import React, {Component} from 'react';
import {Animated, ListRenderItemInfo, View} from 'react-native';
import {KeyboardAwareFlatList, KeyboardAwareFlatListProps} from 'react-native-keyboard-aware-scroll-view';

interface IDraggableItem extends ListRenderItemInfo<any> {
  dragStart(): void;
}

interface IDraggableFlatlistProps extends KeyboardAwareFlatListProps<any> {
  renderItem(item: IDraggableItem);
}

interface IDraggableFlatlistState {
  activeDraggingItem: ListRenderItemInfo<AnimatableListItem>;
  items: AnimatableListItem[];
}

export class AnimatableListItem {
  public itemPosition: Animated.Value;

  constructor(public itemRef) {
    this.itemPosition = new Animated.Value(0);
  }
}

export class DraggableKeyboardAwareFlatlist extends Component<IDraggableFlatlistProps, IDraggableFlatlistState> {
  private _localRefs: any[];
  private draggingAnimationRef: Animated.CompositeAnimation;

  componentWillReceiveProps(nextProps: Readonly<IDraggableFlatlistProps>, nextContext: any): void {
    if (nextProps.data) {
      this.setState({
        items: nextProps.data.map(v => new AnimatableListItem(v))
      });
    }
  }

  render() {
    this._localRefs = [];

    return <View>
      <KeyboardAwareFlatList {...this.props}
                             data={this.state.items}
                             renderItem={info => this.renderItem(info)}/>
      {this.renderDraggedItem()}
    </View>;
  }

  renderItem(item: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
    let draggedItemStyles = [
      {
        visibility: item === this.state.activeDraggingItem ? 'hidden' : 'visible',
        transform: [
          {
            scale: item.item.itemPosition.interpolate({
              inputRange: [0.8, 1],
              outputRange: [1, 0],
              extrapolate: 'clamp'
            })
          }
        ]
      }
    ];

    return <Animated.View style={draggedItemStyles} ref={ref => this._localRefs.push(ref)}>
      {this.props.renderItem({
        index: item.index,
        item: item.item.itemRef,
        separators: item.separators,
        dragStart: () => {
          this.dragStart(item);
        }
      })}
    </Animated.View>;
  }

  renderDraggedItem() {
    return !this.state.activeDraggingItem
      ? null
      : <Animated.View ref={ref => this._localRefs.push(ref)}>
        {this.props.renderItem({
          index: this.state.activeDraggingItem.index,
          item: this.state.activeDraggingItem.item.itemRef,
          separators: this.state.activeDraggingItem.separators,
          dragStart: () => {
            this.dragStart(this.state.activeDraggingItem);
          }
        })}
      </Animated.View>;
  }

  dragStart(item: ListRenderItemInfo<AnimatableListItem>) {
    // get item relative to screen position
    // scale item to 0.8
    // set pan responder to act
    // on pan responder move update list view scroll position and item position to be the same relative on the screen
    if (this.draggingAnimationRef) {
      this.draggingAnimationRef.stop();
      this.setState({
        activeDraggingItem: null
      });
    }

    this.draggingAnimationRef = Animated.timing(item.item.itemPosition, {
      toValue: 1,
      duration: 100
    });

    this.draggingAnimationRef.start(() => {
      this.setState({
        activeDraggingItem: item
      });
      this.draggingAnimationRef = null;
    });
  }
}
