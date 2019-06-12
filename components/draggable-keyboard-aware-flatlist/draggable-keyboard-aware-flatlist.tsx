import React, {Component} from 'react';
import {Animated, ListRenderItemInfo, PanResponder, PanResponderInstance, View} from 'react-native';
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

interface ItemMeasuere {
  x: any;
  width: any;
  y: any;
  pageY: any;
  pageX: any;
  height: any;
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
  private _panResponder: PanResponderInstance;
  private _containerOffset: number;
  private _containerSize: number;
  private activeItemMeasures: ItemMeasuere;

  constructor(props, state) {
    super(props, state);

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => !!this.state.activeDraggingItem,
      onMoveShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
      onPanResponderMove: (e, g) => {
        // make item follow the figner using absolute positioning
        // scroll list up/down using flatlist ref
        // consider creating drop slot on 2 items intersections
      },
      onPanResponderEnd: (e, g) => {
        // drop item to position
        // maybe with animation
      }
    });
  }

  componentWillReceiveProps(nextProps: Readonly<IDraggableFlatlistProps>, nextContext: any): void {
    if (nextProps.data) {
      this.setState({
        items: nextProps.data.map(v => new AnimatableListItem(v))
      });
    }
  }

  render() {
    this._localRefs = [];

    return <View ref={ref => this.measureContainer(ref)}
                 style={{position: 'relative'}}>
      <KeyboardAwareFlatList {...this.props}
                             data={this.state.items}
                             renderItem={info => this.renderItem(info)}/>
      {this.renderDraggedItem()}
    </View>;
  }

  private renderItem(item: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
    const possibleDragStyles = this.getDragItemStyles(item);

    return <Animated.View style={possibleDragStyles}
                          ref={ref => this._localRefs.push(ref)}>
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

  private renderDraggedItem() {
    return !this.state.activeDraggingItem
      ? null
      : <Animated.View style={{
        position: 'absolute',
        transform: [{scale: 0.8}],
        top: this.activeItemMeasures.pageY,
        left: this.activeItemMeasures.pageX,
        width: this.activeItemMeasures.width,
        height: this.activeItemMeasures.height,
      }} ref={ref => this._localRefs.push(ref)}>
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

  private getDragItemStyles(item: ListRenderItemInfo<AnimatableListItem>) {
    return [
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
  }

  private dragStart(item: ListRenderItemInfo<AnimatableListItem>) {
    // get item relative to screen position
    // scale item to 0.8
    // set pan responder to act
    // on pan responder move update list view scroll position and item position to be the same relative on the screen
    if (this.draggingAnimationRef) {
      this.draggingAnimationRef.stop();
      this.setState({
        activeDraggingItem: null
      });
      this.activeItemMeasures = null;
    }

    this._localRefs[item.index].measure((x, y, width, height, pageX, pageY) => {
      this.activeItemMeasures = {
        x, y, width, height, pageX, pageY
      };

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
    });
  }

  // UTILITY
  private measureContainer(ref) {
    if (ref && this._containerOffset === undefined) {
      // setTimeout required or else dimensions reported as 0
      setTimeout(() => {
        ref.measure((x, y, width, height, pageX, pageY) => {
          this._containerOffset = pageY;
          this._containerSize = height;
        });
      }, 50);
    }
  };
}
