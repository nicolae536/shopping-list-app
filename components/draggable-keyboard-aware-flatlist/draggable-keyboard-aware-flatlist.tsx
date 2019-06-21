import React, {Component} from 'react';
import {
    Animated, GestureResponderEvent, ListRenderItemInfo, PanResponder, PanResponderInstance, Vibration, View, ViewToken
} from 'react-native';
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
    private visibleItemIndexes: number[];

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
                const {dy, moveY, y0} = g;

                this._flatListRef.scrollToOffset({
                    offset: this._scrollOffset + (dy / 15),
                    animated: false
                });

                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition({moveY}));
                let nextSpacerIndex = this.getHoveredComponentOffset({pageY, dy, moveY, y0});
                this.showItemSpacer(moveY, y0, nextSpacerIndex);
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

        this._localRefs = [];
        this._localRefsMeasures = [];
        this._pixelToItemIndex = [];

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
                                   onViewableItemsChanged={this.updateVisibleItems}
                                   keyExtractor={(it, index) => this.props.keyExtractor(it.itemRef, index)}
                                   renderItem={info => this.renderItem(info)}/>
            {this.renderDraggedItem()}
        </View>;
    }

    private showItemSpacer(moveY: number, y0: number, nextSpacerIndex: number) {
        if (this.spacerIndex === nextSpacerIndex) {
            return;
        }

        if (this.state.items[this.spacerIndex]) {
            this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
            this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
            this.state.items[this.spacerIndex].hoverTopActive = false;
            this.state.items[this.spacerIndex].hoverBottomActive = false;
        }

        if (nextSpacerIndex === this.state.activeDraggingItem.index) {
            return;
        }

        const showTopOrBottomSpacer = this.getGestureDyRelativeToFlatList(moveY, y0);
        if (showTopOrBottomSpacer < 0) {
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

    private getGestureDyRelativeToFlatList(moveY: number, y0: number) {
        // y0 -> gesture start position
        // moveY -> gesture current move
        // moveY - y0 -> gesture dy difference
        // moveY - y0 + this._scrollOffset -> gesture dy difference relative to list scroll offset
        return moveY - y0 + this._scrollOffset;
    }

    private renderItem(it: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
        return <DraggableListItem itemDef={it}
                                  setItemRef={(ref) => {
                                      this._localRefs[it.index] = ref;
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
        await this.measureVisibleItems();
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

    private measureContainer(ref) {
        if (ref && this._containerOffset === undefined) {
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

    private getHoveredComponentOffset({pageY, dy, moveY, y0}: { pageY: number, dy: number, moveY: number, y0: number }) {
        const {activeItemMeasures} = this.state;

        // activeItemMeasures.pageY -> item position relative to viewport
        // activeItemMeasures.pageY + this._scrollOffset -> item position relative to Flatlist
        // moveY - y0 -> gesture dy relative to screen
        const hoveredPixelOffsetRelativeToFlatListAndDraggedElement = Math.round(activeItemMeasures.pageY + this._scrollOffset + (moveY - y0));
        const itemIndex = this._pixelToItemIndex[hoveredPixelOffsetRelativeToFlatListAndDraggedElement];

        const minItem = 0;
        const maxItem = this.props.data.length - 1;

        if (itemIndex || itemIndex === 0) {
            console.log('pixel -> ', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, 'index -> ', itemIndex);
            return itemIndex;
        }

        if (pageY < this._minOffset) {
            return minItem;
        }

        if (pageY > this._maxOffset) {
            return maxItem;
        }

        if (dy > 0 && hoveredPixelOffsetRelativeToFlatListAndDraggedElement < this._maxOffset) {
            let cursor = hoveredPixelOffsetRelativeToFlatListAndDraggedElement;
            while (!this._pixelToItemIndex[cursor] && cursor < this._maxOffset) {
                cursor++;
            }

            console.log('pixel -> ', cursor, 'index -> ', this._pixelToItemIndex[cursor] || minItem);
            return this._pixelToItemIndex[cursor] || minItem;
        }

        if (dy < 0 && hoveredPixelOffsetRelativeToFlatListAndDraggedElement > this._minOffset) {
            let cursor = hoveredPixelOffsetRelativeToFlatListAndDraggedElement;
            while (!this._pixelToItemIndex[cursor] && cursor > this._minOffset) {
                cursor--;
            }

            console.log('pixel -> ', cursor, 'index -> ', this._pixelToItemIndex[cursor] || maxItem);
            return this._pixelToItemIndex[cursor] || maxItem;
        }

        const fallbackValue = dy < 0 ? minItem : maxItem;
        console.log('pixel -> ', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, 'index -> ', fallbackValue);
        return fallbackValue;
    }

    private updateVisibleItems = (info: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
        this.visibleItemIndexes = [];
        info.viewableItems.forEach(v => {
            if (v.isViewable) {
                this.visibleItemIndexes.push(v.index);
            }
        });
        this.measureVisibleItems();
    };

    private measureVisibleItems() {
        const refsToMeasure = [];

        for (const visibleIndex of this.visibleItemIndexes) {
            if (this._localRefs[visibleIndex] && (!this._localRefsMeasures[visibleIndex] || !this._localRefsMeasures[visibleIndex].isMeasured)) {
                refsToMeasure.push({
                    index: visibleIndex,
                    item: this._localRefs[visibleIndex]
                });
            }
        }

        if (!refsToMeasure.length) {
            return new Promise((resolve => resolve()));
        }

        return new Promise(((resolve) => {
            setTimeout(() => {
                let measuredCount = 0;

                const increaseAndCheckPromiseEnd = () => {
                    measuredCount++;
                    if (measuredCount === refsToMeasure.length) {
                        resolve();
                    }
                };
                refsToMeasure.forEach((m) => {
                    if (!m.item || (this._localRefsMeasures[m.index] && this._localRefsMeasures[m.index].isMeasured)) {
                        increaseAndCheckPromiseEnd();
                        return;
                    }

                    m.item.measure((x, y, width, height, pageX, pageY) => {
                        this._localRefsMeasures[m.index] = {
                            x, y, width, height, pageX, pageY,
                            isMeasured: (!!x || !!y || !!width || !!height || !!pageX || !!pageY)
                        };
                        this.updatePixelsToIndexMap(pageY, height, m.index);
                        increaseAndCheckPromiseEnd();
                    });
                });
            }, 50);
        }));
    }

    private updatePixelsToIndexMap(pageY, height, index) {
        const itemOffsetRelativeToFlatList = pageY + this._scrollOffset;
        const min = Math.floor(itemOffsetRelativeToFlatList);
        const max = Math.round(itemOffsetRelativeToFlatList + height);

        if (min <= this._minOffset) {
            this._minOffset = +min;
        }
        if (max >= this._maxOffset) {
            this._maxOffset = +max;
        }

        for (let i = min; i <= max; i++) {
            this._pixelToItemIndex[i] = index;
        }
        // console.log('min', min, '->', 'max', max, index);
    }
}
