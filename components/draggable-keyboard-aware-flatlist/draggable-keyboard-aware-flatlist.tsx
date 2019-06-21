import React, {Component} from 'react';
import {Animated, GestureResponderEvent, ListRenderItemInfo, PanResponder, PanResponderInstance, Vibration, View} from 'react-native';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {DraggableListItem} from './draggable-list-item';
import {IDraggableFlatListProps, IDraggableFlatListState, AnimatableListItem} from './draggable-list.models';


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
                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition({moveY: g.moveY}));
            },
            onPanResponderMove: async (e, g) => {
                const {pageY} = e.nativeEvent;
                const {dy, moveY} = g;

                this._flatListRef.scrollToOffset({
                    offset: this._scrollOffset + (dy / 15),
                    animated: false
                });

                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition({moveY}));
                let nextSpacerIndex = this.getHoveredComponentOffset({pageY, dy});
                if (this.spacerIndex === nextSpacerIndex) {
                    return;
                }

                // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.showItemSpacer(dy, nextSpacerIndex);
                // await this.measureAllItems();
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
                        this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
                        this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
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

    getPosition({moveY}: { moveY: number }) {
        const newGesturePosition = moveY - this._containerOffset;

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
                     style={{position: 'relative', flex: 1}}
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

    private showItemSpacer(dy: number, nextSpacerIndex) {
        if (this.state.items[this.spacerIndex]) {
            console.log('Reset item');
            this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
            this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
            this.state.items[this.spacerIndex].hoverTopActive = false;
            this.state.items[this.spacerIndex].hoverBottomActive = false;
        }

        if (nextSpacerIndex === this.state.activeDraggingItem.index) {
            return;
        }

        if (dy < 0) {
            if (nextSpacerIndex !== null && nextSpacerIndex !== undefined) {
                this.state.items[nextSpacerIndex].isItemHoveredTop.setValue(1);
                this.state.items[nextSpacerIndex].hoverTopActive = true;
                this.spacerIndex = nextSpacerIndex;
            }

            return;
        }

        if (nextSpacerIndex !== null && nextSpacerIndex !== undefined) {
            this.state.items[nextSpacerIndex].isItemHoveredBottom.setValue(1);
            this.state.items[nextSpacerIndex].hoverBottomActive = true;
            this.spacerIndex = nextSpacerIndex;
        }
    }

    private renderItem(it: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
        return <DraggableListItem itemDef={it}
                                  onRefMeasureUpdate={() => {
                                  }}
                                  renderItem={item => this.props.renderItem(item)}
                                  onDragStart={(it, event) => this.dragStart(it, event)}/>;
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
                activeDraggingItem: null
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
                duration: 100
            });

            Vibration.vibrate(50);
            this.draggingAnimationRef.start(() => {
                this.draggingAnimationRef = null;
            });
        });
    }

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

    private getHoveredComponentOffset({pageY, dy}: { pageY: number, dy: number }) {
        const {activeItemMeasures} = this.state;
        const nextItemPixelOffset = Math.round(this._scrollOffset + dy + activeItemMeasures.pageY);
        const itemIndex = this._pixelToItemIndex[nextItemPixelOffset];
        const minItem = 0;
        const maxItem = this.props.data.length - 1;

        if (itemIndex || itemIndex === 0) {
            return itemIndex;
        }

        // if (g.dy > 0 && nextItemPixelOffset < this._maxOffset) {
        //   let cursor = nextItemPixelOffset;
        //   while (!this._pixelToItemIndex[cursor] && cursor < this._maxOffset) {
        //     cursor++;
        //   }
        //
        //   return this._pixelToItemIndex[cursor] || minItem;
        // }
        //
        // if (g.dy < 0 && nextItemPixelOffset > this._minOffset) {
        //   let cursor = nextItemPixelOffset;
        //   while (!this._pixelToItemIndex[cursor] && cursor > this._minOffset) {
        //     cursor--;
        //   }
        //
        //   return this._pixelToItemIndex[cursor] || maxItem;
        // }

        if (pageY < this._minOffset) {
            return minItem;
        }

        if (pageY > this._maxOffset) {
            return maxItem;
        }

        return dy < 0 ? minItem : maxItem;
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
                    this._localRefsMeasures[index] = {
                        x, y, width, height, pageX, pageY,
                        isMeasured: (!!x || !!y || !!width || !!height || !!pageX || !!pageY)
                    };
                    const min = Math.floor(pageY);
                    const max = Math.round(pageY + height);

                    if (min <= this._minOffset) {
                        this._minOffset = +min;
                    }
                    if (max >= this._maxOffset) {
                        this._maxOffset = +max;
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
        return <Animated.View style={{
            height: it.item.isItemHoveredTop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 65],
                extrapolate: 'clamp'
            })
        }}>
        </Animated.View>;
    }

    private renderSpacerBottom(it: ListRenderItemInfo<AnimatableListItem>) {
        return <Animated.View style={{
            height: it.item.isItemHoveredBottom.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 65],
                extrapolate: 'clamp'
            })
        }}>
        </Animated.View>;
    }
}
