import React, {Component} from 'react';
import {Animated, GestureResponderEvent, ListRenderItemInfo, PanResponder, PanResponderGestureState, PanResponderInstance, Vibration, View} from 'react-native';
import {KeyboardAwareFlatList, KeyboardAwareFlatListProps} from 'react-native-keyboard-aware-scroll-view';

interface IDraggableItem extends ListRenderItemInfo<any> {
  dragStart(ev: GestureResponderEvent): void;
}

interface IDraggableFlatListProps extends KeyboardAwareFlatListProps<any> {
  renderItem(item: IDraggableItem);
}

interface IDraggableFlatListState {
  activeDraggingItem: ListRenderItemInfo<AnimatableListItem>;
  activeItemMeasures: ItemMeasure;
  draggingItemSpacerPosition: Animated.Value;
  items: AnimatableListItem[];
}

interface ItemMeasure {
  x: any;
  width: any;
  y: any;
  pageY: any;
  pageX: any;
  height: any;
}

export class AnimatableListItem {
  public isItemDragged: Animated.Value;
  public itemYPosition: Animated.Value;
  public isItemHovered: Animated.Value;

  constructor(public itemRef) {
    this.isItemDragged = new Animated.Value(0);
    this.itemYPosition = new Animated.Value(0);
    this.isItemHovered = new Animated.Value(0);
  }
}

export class DraggableKeyboardAwareFlatlist extends Component<IDraggableFlatListProps, IDraggableFlatListState> {
  private _localRefs: any[];
  private _localRefsMeasures: any[];
  private _flatListRef: any;

  private _panResponder: PanResponderInstance;

  private _containerOffset: number;
  private _containerSize: number;

  private draggingAnimationRef: Animated.CompositeAnimation;
  private _scrollOffset: number;
  private _pixelToItemIndex: number[];
  private _minOffset: number = 100000;
  private _maxOffset: number = -1;
  private spacerIndex: number;

  constructor(props, state) {
    super(props, state);
    this._scrollOffset = 0;
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => !!this.state.activeDraggingItem,
      onStartShouldSetPanResponderCapture: (e, g) => !!this.state.activeDraggingItem,
      onMoveShouldSetPanResponder: () => !!this.state.activeDraggingItem,
      onMoveShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
      onPanResponderGrant: (e, g) => {
        this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition(g));
      },
      onPanResponderMove: (e, g) => {
        this._flatListRef.scrollToOffset({
          offset: this._scrollOffset + g.dy,
          animated: false
        });

        let nextSpacerIndex = this.getHoveredComponentOffset(e, g);
        console.log('Next hover', nextSpacerIndex);
        this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition(g));
        if (this.spacerIndex === nextSpacerIndex ||
          this.state.activeDraggingItem.index === nextSpacerIndex) {
          return;
        }

        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (this.spacerIndex !== null && this.spacerIndex !== undefined) {
          this.state.items[this.spacerIndex].isItemHovered.setValue(0);
        }
        if (this.state.items[nextSpacerIndex]) {
          this.state.items[nextSpacerIndex].isItemHovered.setValue(1);
        }
        this.spacerIndex = nextSpacerIndex;
        // make item follow the figner using absolute positioning
        // scroll list up/down using flatlist ref
        // consider creating drop slot on 2 items intersections
      },
      onPanResponderEnd: (e, g) => {
        Animated.timing(this.state.activeDraggingItem.item.isItemDragged, {
          toValue: 0,
          duration: 100
        }).start(() => {

          if (this.state.items[this.spacerIndex]) {
            this.state.items[this.spacerIndex].isItemHovered.setValue(0);
          }
          this.setState({
            activeItemMeasures: null,
            activeDraggingItem: null
          });
        });
        // drop item to position
        // maybe with animation
      }
    });

    this.state = {
      activeDraggingItem: null,
      activeItemMeasures: null,
      draggingItemSpacerPosition: new Animated.Value(-1),
      items: props.data ? props.data.map(v => new AnimatableListItem(v)) : []
    };
  }

  getPosition(g) {
    const newGesturePosition = g.moveY - this._containerOffset;

    if (newGesturePosition < 0) {
      return 0;
    }

    if (newGesturePosition > this._containerOffset + this._containerSize) {
      return this._containerSize;
    }

    return newGesturePosition;
  }

  componentWillReceiveProps(nextProps: Readonly<IDraggableFlatListProps>, nextContext: any): void {
    if (nextProps.data) {
      this.setState({
        items: nextProps.data.map(v => new AnimatableListItem(v))
      });
    }
  }

  render() {
    this._localRefs = [];
    if (!this.state.items) {
      return <View/>;
    }

    return <View ref={ref => this.measureContainer(ref)}
                 onLayout={() => {
                 }}
                 style={{position: 'relative'}}
                 {...this._panResponder.panHandlers}>
      <KeyboardAwareFlatList {...this.props}
                             innerRef={ref => {
                               this._flatListRef = ref;
                             }}
                             scrollEnabled={!this.state.activeDraggingItem}
                             data={this.state.items}
                             onScroll={({nativeEvent}) => {
                               this._scrollOffset = nativeEvent.contentOffset['y'];
                             }}
                             keyExtractor={(it, index) => this.props.keyExtractor(it.itemRef, index)}
                             renderItem={info => this.renderItem(info)}/>
      {this.renderDraggedItem()}
    </View>;
  }

  private renderItem(it: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
    const possibleDragStyles = this.getDragItemStyles(it);

    return <Animated.View style={possibleDragStyles}>
      {it.index !== this.props.data.length - 1 ? this.renderSpacer(it) : null}
      <View onLayout={({nativeEvent}) => {
      }}
            ref={ref => {
              this._localRefs[it.index] = ref;
            }}>
        {this.props.renderItem({
          index: it.index,
          item: it.item.itemRef,
          separators: it.separators,
          dragStart: (event: GestureResponderEvent) => {
            this.dragStart(it, event);
          }
        })}
        {it.index === this.props.data.length - 1 ? this.renderSpacer(it) : null}
      </View>
    </Animated.View>;
  }

  private renderDraggedItem() {
    const styles = this.state.activeItemMeasures
      ? {
        width: this.state.activeItemMeasures.width,
        height: this.state.activeItemMeasures.height,
        opacity: this.state.activeDraggingItem.item.isItemDragged.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp'
        }),
        transform: [
          {
            scale: 0.9
          },
          {
            translateY: this.state.activeDraggingItem.item.itemYPosition
          }
        ]
      } : {};

    return !this.state.activeDraggingItem
      ? null
      : <Animated.View style={[{
        position: 'absolute'
      }, styles]}>
        {this.props.renderItem({
          index: this.state.activeDraggingItem.index,
          item: this.state.activeDraggingItem.item.itemRef,
          separators: this.state.activeDraggingItem.separators,
          dragStart: (ev) => {
          }
        })}
      </Animated.View>;
  }

  private getDragItemStyles(item: ListRenderItemInfo<AnimatableListItem>) {
    return [
      {
        overflow: 'hidden',
        opacity: item.item.isItemDragged.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        }),
        transform: [
          {
            scale: item.item.isItemDragged.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
              extrapolate: 'clamp'
            })
          }
        ]
      }
    ];
  }

  private async dragStart(it: ListRenderItemInfo<AnimatableListItem>, ev: GestureResponderEvent) {
    // get it relative to screen position
    // scale it to 0.8
    // set pan responder to act
    // on pan responder move update list view scroll position and it position to be the same relative on the screen
    await this.measureAllItems();
    it.item.itemYPosition.setValue(ev.nativeEvent.pageY - this._containerOffset);

    if (this.draggingAnimationRef) {
      this.draggingAnimationRef.stop();
      this.setState({
        activeItemMeasures: null,
        activeDraggingItem: null,
      });
    }

    !!this._localRefs[it.index] && this._localRefs[it.index].measure((x, y, width, height, pageX, pageY) => {
      it.item.itemYPosition.setValue(it.index * height);
      this.setState({
        activeItemMeasures: {
          x, y, width, height, pageX, pageY
        },
        activeDraggingItem: it
      });

      this.draggingAnimationRef = Animated.timing(it.item.isItemDragged, {
        toValue: 1,
        duration: 100,
      });

      Vibration.vibrate(50);
      this.draggingAnimationRef.start(() => {
        this.draggingAnimationRef = null;
      });
    });
  }

  private scroll(scrollAmt, spacerIndex) {
    if (spacerIndex >= this.props.data.length) {
      return this._flatListRef.scrollToEnd();
    }
    if (spacerIndex === -1) {
      return;
    }
    const currentScrollOffset = this._scrollOffset;
    const newOffset = currentScrollOffset + scrollAmt;
    const offset = Math.max(0, newOffset);
    // this._flatListRef.scrollToOffset({offset, animated: false});
  };

  // UTILITY
  private measureContainer(ref) {
    if (ref && this._containerOffset === undefined) {
      // setTimeout required or else dimensions reported as 0
      setTimeout(() => {
        if (!ref) {
          return;
        }
        ref.measure((x, y, width, height, pageX, pageY) => {
          this._containerOffset = pageY;
          this._containerSize = height;
        });
      }, 50);
    }
  };

  private getHoveredComponentOffset(e: GestureResponderEvent, g: PanResponderGestureState) {
    const activeItemMeasure = this._localRefsMeasures[this.state.activeDraggingItem.index];
    let heightMultiplier = g.dy > 0 ? 1 : -1;

    const nextItemPixelOffset = Math.round(g.dy + activeItemMeasure.pageY + (heightMultiplier * activeItemMeasure.height / 2));
    const itemIndex = this._pixelToItemIndex[nextItemPixelOffset];
    const minItem = 0;
    const maxItem = this.props.data.length - 1;

    if (itemIndex !== null || itemIndex !== undefined) {
      return itemIndex;
    }

    if (g.dy > 0 && nextItemPixelOffset < this._maxOffset) {
      let cursor = nextItemPixelOffset;
      while (!this._pixelToItemIndex[cursor] && cursor < this._maxOffset) {
        cursor++;
      }

      return this._pixelToItemIndex[cursor] || minItem;
    }

    if (g.dy < 0 && nextItemPixelOffset > this._minOffset) {
      let cursor = nextItemPixelOffset;
      while (!this._pixelToItemIndex[cursor] && cursor > this._minOffset) {
        cursor--;
      }

      return this._pixelToItemIndex[cursor] || maxItem;
    }

    if (e.nativeEvent.pageY < this._minOffset) {
      return minItem;
    }

    if (e.nativeEvent.pageY > this._maxOffset) {
      return maxItem;
    }

    return minItem;
  }

  private measureAllItems() {
    return new Promise((r) => {
      this._localRefsMeasures = [];
      this._pixelToItemIndex = [];
      this._localRefs.forEach((m, index) => {
        if (!m) {
          return;
        }

        m.measure((x, y, width, height, pageX, pageY) => {
          this._localRefsMeasures[index] = {x, y, width, height, pageX, pageY};

          const min = Math.floor(pageY);
          const max = Math.round(pageY + height);

          if (min <= this._minOffset) {
            this._minOffset = min;
          }
          if (max >= this._maxOffset) {
            this._maxOffset = max;
          }

          for (let i = min; i <= max; i++) {
            this._pixelToItemIndex[i] = index;
          }

          if (this._localRefs.length === this._localRefsMeasures.length) {
            console.log('Measures', this._localRefsMeasures);
            r();
          }
        });
      });
    });
  }

  private renderSpacer(it: ListRenderItemInfo<AnimatableListItem>) {
    if (it === this.state.activeDraggingItem) {
      return <Animated.View style={{height: 0}}/>;
    }


    return <Animated.View style={{
      height: it.item.isItemHovered.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 65],
        extrapolate: 'clamp'
      })
    }}>
    </Animated.View>;
  }
}
