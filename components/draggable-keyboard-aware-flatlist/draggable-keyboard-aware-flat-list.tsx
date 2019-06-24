import {AntDesign} from '@expo/vector-icons';
import React, {PureComponent} from 'react';
import {
    Animated, FlatList, GestureResponderEvent, LayoutAnimation, ListRenderItemInfo, PanResponder, PanResponderGestureState,
    PanResponderInstance, Vibration, View, ViewToken
} from 'react-native';
import {DraggableListItem} from './draggable-list-item';
import {
    AnimatableListItem, IDraggableFlatListProps, IDraggableFlatListState, ItemMeasurableRef, ItemMeasure
} from './draggable-list.models';
import {KeyboardSpacer} from './keyboard-spacer';


export class DraggableKeyboardAwareFlatList extends PureComponent<IDraggableFlatListProps, IDraggableFlatListState> {
    private _localRefs: ItemMeasurableRef[];
    private _localRefsMeasures: ItemMeasure[];
    private _pixelToItemIndex: number[];

    private _flatListRef: any; // is a FlatList
    private _panResponder: PanResponderInstance;
    private _containerOffset: number;
    private _containerSize: number;
    private draggingAnimationRef: Animated.CompositeAnimation;
    private spacerIndex: number;
    private visibleItemIndexes: number[];

    // Initialized variables
    private _scrollOffset: number = 0;
    private _minOffset: number = 100000;
    private _maxOffset: number = -1;

    constructor(props, state) {
        super(props, state);
        this.setupPanResponder();
        this.resetItemsRefMeasuresAndPixelsToIndexes();

        this.state = {
            activeDraggingItem: null,
            activeItemMeasures: null,
            items: props.data ? props.data.map(v => new AnimatableListItem(v)) : []
        };
    }

    componentWillReceiveProps(nextProps: Readonly<IDraggableFlatListProps>, nextContext: any): void {
        if (nextProps.data) {
            this.resetItemsRefMeasuresAndPixelsToIndexes();
            this.setState({
                items: nextProps.data.map(v => new AnimatableListItem(v))
            });
        }
    }

    render() {
        if (!this.state.items) {
            return <View/>;
        }


        return <View style={{flex: 1}}>
            <View ref={ref => this.measureFlatListContainerContainer(ref)}
                  onLayout={() => {
                  }}
                  style={{position: 'relative', flex: 1}}
                  {...this._panResponder.panHandlers}>
                <FlatList {...this.props}
                          ref={ref => {
                              this._flatListRef = ref;
                          }}
                          keyboardDismissMode={'interactive'}
                          keyboardShouldPersistTaps={'handled'}
                          scrollEnabled={!this.state.activeDraggingItem}
                          data={this.state.items}
                          onScroll={({nativeEvent}) => {
                              this._scrollOffset = nativeEvent.contentOffset['y'];
                          }}
                          onViewableItemsChanged={this.handleVisibleItemsChanged}
                          keyExtractor={(it, index) => this.props.keyExtractor(it.itemRef, index)}
                          renderItem={info => this.renderItem(info)}/>
                {this.renderTopDragArea(true)}
                {this.renderTopDragArea(false)}
                {this.renderDraggedItem()}
            </View>
            <KeyboardSpacer onKeyboardClosed={() => {
                if (this.props.onKeyboardClosed) {
                    this.props.onKeyboardClosed();
                }
            }} onKeyboardOpened={() => {
                if (this.props.onKeyboardOpened) {
                    this.props.onKeyboardOpened();
                }
            }}/>
        </View>;
    }

    private renderItem(it: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
        return <DraggableListItem itemDef={it}
                                  setItemRef={(ref) => {
                                      this._localRefs[it.index] = ref;
                                  }}
                                  renderItem={item => this.props.renderItem(item)}
                                  onDragStart={(it, event) => this.handleDragStart(it, event)}/>;
    }

    private renderTopDragArea(isTop: boolean) {
        const styles: any = isTop ? {
            top: 0
        } : {
            bottom: 0
        };

        return !this.state.activeDraggingItem
            ? null
            : <Animated.View style={[{
                position: 'absolute',
                height: this.state.activeDraggingItem.item.isItemDragged.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 75],
                    extrapolate: 'clamp'
                }),
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }, styles]}>
                <AntDesign size={32} name={isTop ? 'arrowup' : 'arrowdown'}/>
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

    private measureFlatListContainerContainer(ref) {
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

    private async handleDragStart(it: ListRenderItemInfo<AnimatableListItem>, ev: GestureResponderEvent) {
        if (this.state.activeDraggingItem) {
            this.resetDraggedItemStateState();
        }

        await this.updateMeasuresForVisibleItems();
        it.item.itemYPosition.setValue(ev.nativeEvent.pageY - this._containerOffset);

        if (this.draggingAnimationRef) {
            this.draggingAnimationRef.stop();
            this.setState({
                activeItemMeasures: null,
                activeDraggingItem: null
            });
        }

        const itemMeasures = this._localRefsMeasures[it.index];
        it.item.itemYPosition.setValue(it.index * itemMeasures.height);
        this.setState({
            activeItemMeasures: {
                ...itemMeasures
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
    }

    private handleVisibleItemsChanged = (info: { viewableItems: Array<ViewToken>; changed: Array<ViewToken> }) => {
        this.visibleItemIndexes = [];
        info.viewableItems.forEach(v => {
            if (v.isViewable) {
                this.visibleItemIndexes.push(v.index);
            }
        });
        setTimeout(() => this.updateMeasuresForVisibleItems());
    };

    private updateMeasuresForVisibleItems() {
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
                        this.updatePixelsToItemIndexMap(pageY, height, m.index);
                        increaseAndCheckPromiseEnd();
                    });
                });
            }, 50);
        }));
    }

    private updatePixelsToItemIndexMap(pageY, height, index) {
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
        this.logPixelsArrayDetails(min, max, index);
    }

    private setupPanResponder() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => !!this.state.activeDraggingItem,
            onStartShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
            onMoveShouldSetPanResponder: () => !!this.state.activeDraggingItem,
            onMoveShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
            onPanResponderGrant: (e, g) => {
                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getDraggedItemPositionRelativeToFlatList({
                    moveY: g.moveY, y0: g.y0
                }));
            },
            onPanResponderMove: async (e, g) => this.handlePanResponderMove(e, g),
            onPanResponderRelease: () => requestAnimationFrame(() => this.handleGestureEnd()),
            onPanResponderTerminate: () => requestAnimationFrame(() => this.handleGestureEnd())
        });
    }

    private handlePanResponderMove(e: GestureResponderEvent, g: PanResponderGestureState) {
        const {pageY} = e.nativeEvent;
        const {dy, moveY, y0} = g;

        const scrollAreaHeight = 65;
        const topScrollStart = this._containerOffset;
        const topScrollEnd = this._containerOffset + scrollAreaHeight;
        const bottomScrollAreaStart = this._containerOffset + this._containerSize - scrollAreaHeight;
        const bottomScrollAreaEnd = this._containerOffset + this._containerSize;

        let currentScrollOffset = this._scrollOffset;

        // Update animation in the next frame
        requestAnimationFrame(() => {
            if (!this.state.activeDraggingItem) {
                return;
            }

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const nextScrollOffset = this.getNextScrollOffset(pageY, topScrollStart, topScrollEnd, currentScrollOffset, bottomScrollAreaStart, bottomScrollAreaEnd);
            this.state.activeDraggingItem.item.itemYPosition.setValue(this.getDraggedItemPositionRelativeToFlatList({moveY, y0}));
            let nextSpacerIndex = this.getHoveredComponentOffset({pageY, dy, moveY, y0, scrollOffset: nextScrollOffset});
            this.showDropSlotSpacer(moveY, y0, nextSpacerIndex, nextScrollOffset);

            if (nextScrollOffset === currentScrollOffset) {
                return;
            }
            this._flatListRef.scrollToOffset({
                offset: nextScrollOffset
            });
        });
    }

    private getNextScrollOffset(pageY, topScrollStart, topScrollEnd, nextScrollOffset, bottomScrollAreaStart, bottomScrollAreaEnd) {
        if ((pageY >= topScrollStart && pageY <= topScrollEnd) ||
            (pageY < topScrollStart && pageY <= topScrollEnd)) {
            return nextScrollOffset - 12;
        }
        if ((pageY >= bottomScrollAreaStart && pageY <= bottomScrollAreaEnd) ||
            (pageY >= bottomScrollAreaStart && pageY > bottomScrollAreaEnd)) {
            return nextScrollOffset + 12;
        }
        return nextScrollOffset;
    }

    private getDraggedItemPositionRelativeToFlatList({moveY, y0}: { moveY: number, y0: number }) {
        const gestureDirection = moveY - y0;
        const newGesturePosition = moveY - this._containerOffset;

        if (newGesturePosition < 0) {
            return 0;
        }

        if (newGesturePosition > (this._containerOffset + this._containerSize)) {
            return this._containerSize;
        }

        return newGesturePosition;
    }

    private getHoveredComponentOffset({pageY, dy, moveY, y0, scrollOffset}: { pageY: number, dy: number, moveY: number, y0: number, scrollOffset: number }) {
        const {activeItemMeasures} = this.state;

        // activeItemMeasures.pageY -> item position relative to viewport
        // activeItemMeasures.pageY + this._scrollOffset -> item position relative to Flatlist
        // moveY - y0 -> gesture dy relative to screen

        const gesturePositionRelativeToFlatlist = this.getDraggedItemPositionRelativeToFlatList({moveY, y0});
        const hoveredPixelOffsetRelativeToFlatListAndDraggedElement = Math.round(this._containerOffset + scrollOffset + gesturePositionRelativeToFlatlist);
        const itemIndex = this._pixelToItemIndex[hoveredPixelOffsetRelativeToFlatListAndDraggedElement];

        const minItemIndex = 0;
        const maxItemIndex = this.props.data.length - 1;

        if (itemIndex || itemIndex === 0) {
            this.logHoveredComponent('Item found', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, itemIndex);
            return itemIndex;
        }

        if (pageY < this._minOffset) {
            this.logHoveredComponent('Item outside of min offset', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, minItemIndex);
            return minItemIndex;
        }

        if (pageY > this._maxOffset) {
            this.logHoveredComponent('Item outside of max offset', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, maxItemIndex);
            return maxItemIndex;
        }

        if (dy > 0 && hoveredPixelOffsetRelativeToFlatListAndDraggedElement < this._maxOffset) {
            let cursor = hoveredPixelOffsetRelativeToFlatListAndDraggedElement;
            while (!this._pixelToItemIndex[cursor] && cursor < this._maxOffset) {
                cursor++;
            }

            const minToReturn = this._pixelToItemIndex[cursor] || minItemIndex;
            this.logHoveredComponent('Item found looking over near pixels bottom of the gesture', cursor, minToReturn);
            return minToReturn;
        }

        if (dy < 0 && hoveredPixelOffsetRelativeToFlatListAndDraggedElement > this._minOffset) {
            let cursor = hoveredPixelOffsetRelativeToFlatListAndDraggedElement;
            while (!this._pixelToItemIndex[cursor] && cursor > this._minOffset) {
                cursor--;
            }

            const maxToReturn = this._pixelToItemIndex[cursor] || maxItemIndex;
            this.logHoveredComponent('Item found looking over near pixels top of the gesture', cursor, maxToReturn);
            return maxToReturn;
        }

        const fallbackValue = dy < 0 ? minItemIndex : maxItemIndex;
        this.logHoveredComponent('Could not find item showing fallback', hoveredPixelOffsetRelativeToFlatListAndDraggedElement, fallbackValue);
        return fallbackValue;
    }

    private showDropSlotSpacer(moveY: number, y0: number, nextSpacerIndex: number, nextScrollOffset: number) {
        if (this.spacerIndex === nextSpacerIndex) {
            return;
        }

        if (this.state.items[this.spacerIndex]) {
            this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
            this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
            this.state.items[this.spacerIndex].hoverTopActive = false;
            this.state.items[this.spacerIndex].hoverBottomActive = false;
        }

        if (this.state.activeDraggingItem && nextSpacerIndex === this.state.activeDraggingItem.index) {
            return;
        }

        const showTopOrBottomSpacer = this.getGestureDyRelativeToFlatList(moveY, y0, nextScrollOffset);
        if (showTopOrBottomSpacer < 0) {
            if (nextSpacerIndex !== null && nextSpacerIndex !== undefined && this.state.items[nextSpacerIndex]) {
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

    private getGestureDyRelativeToFlatList(moveY: number, y0: number, nextScrollOffset: number) {
        // y0 -> gesture start position
        // moveY -> gesture current move
        // moveY - y0 -> gesture dy difference
        // moveY - y0 + this._scrollOffset -> gesture dy difference relative to list scroll offset
        return moveY - y0 + nextScrollOffset;
    }

    private handleGestureEnd() {
        if (!this.state.activeDraggingItem) {
            return;
        }

        if (this.spacerIndex === this.state.activeDraggingItem.index) {
            this.resetDraggedItemStateState();
            return;
        }

        if (!this.state.items[this.spacerIndex]) {
            return;
        }

        const newItemsList = [];
        this.state.items.forEach((v, idx) => {
            if (this.state.activeDraggingItem.item === v) {
                return;
            }
            if (idx === this.spacerIndex && this.state.items[this.spacerIndex].hoverTopActive) {
                newItemsList.push(this.state.activeDraggingItem.item);
            }
            newItemsList.push(v);
            if (idx === this.spacerIndex && this.state.items[this.spacerIndex].hoverBottomActive) {
                newItemsList.push(this.state.activeDraggingItem.item);
            }
        });

        this.state.activeDraggingItem.item.isItemDragged.setValue(0);
        this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
        this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            activeItemMeasures: null,
            activeDraggingItem: null,
            items: newItemsList
        });
        this.props.onItemsDropped(newItemsList.map(v => v.itemRef));
    }

    private resetDraggedItemStateState() {
        if (this.state.activeDraggingItem) {
            this.state.activeDraggingItem.item.isItemDragged.setValue(0);
        }
        if (this.state.items[this.spacerIndex]) {
            this.state.items[this.spacerIndex].isItemHoveredTop.setValue(0);
            this.state.items[this.spacerIndex].isItemHoveredBottom.setValue(0);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({
            activeItemMeasures: null,
            activeDraggingItem: null
        });
    }

    private resetItemsRefMeasuresAndPixelsToIndexes() {
        this._localRefs = [];
        this._localRefsMeasures = [];
        this._pixelToItemIndex = [];
    }

    private logPixelsArrayDetails(min, max, index) {
        // console.log('min', min, '->', 'max', max, index);
    }

    private logHoveredComponent(prefix, componentPixel, indexValue) {
        // console.log(prefix, 'pixel -> ', componentPixel, 'index -> ', indexValue);
    }
}
