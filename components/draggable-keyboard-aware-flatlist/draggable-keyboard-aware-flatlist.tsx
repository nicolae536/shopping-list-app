import React, {Component} from 'react';
import {Animated, ListRenderItemInfo, PanResponder, PanResponderInstance, View, GestureResponderEvent, Vibration} from 'react-native';
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
    public itemPosition: Animated.Value;
    public itemYPosition: Animated.Value;

    constructor(public itemRef) {
        this.itemPosition = new Animated.Value(0);
        this.itemYPosition = new Animated.Value(0);
    }
}

export class DraggableKeyboardAwareFlatlist extends Component<IDraggableFlatListProps, IDraggableFlatListState> {
    private _localRefs: any[];
    private _flatListRef: any;

    private _panResponder: PanResponderInstance;

    private _containerOffset: number;
    private _containerSize: number;

    private draggingAnimationRef: Animated.CompositeAnimation;

    constructor(props, state) {
        super(props, state);

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, g) => !!this.state.activeDraggingItem,
            onStartShouldSetPanResponderCapture: (e, g) => !!this.state.activeDraggingItem,
            onMoveShouldSetPanResponder: () => !!this.state.activeDraggingItem,
            onMoveShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
            onPanResponderGrant: (e, g) => {
                // Animated.timing(this.state.activeDraggingItem.item.itemYPosition, {
                //     duration: 5,
                //     toValue: this.getPosition(g)
                // }).start();
                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition(g));
            },
            onPanResponderMove: (e, g) => {
                this.state.activeDraggingItem.item.itemYPosition.setValue(this.getPosition(g));
                // this._flatListRef.
                // make item follow the figner using absolute positioning
                // scroll list up/down using flatlist ref
                // consider creating drop slot on 2 items intersections
            },
            onPanResponderEnd: (e, g) => {
                Animated.timing(this.state.activeDraggingItem.item.itemPosition, {
                    toValue: 0,
                    duration: 100
                }).start(() => {
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
                                   ref={ref => this._flatListRef = ref}
                                   scrollEnabled={!this.state.activeDraggingItem}
                                   data={this.state.items}
                                   keyExtractor={(it, index) => this.props.keyExtractor(it.itemRef, index)}
                                   renderItem={info => this.renderItem(info)}/>
            {this.renderDraggedItem()}
        </View>;
    }

    private renderItem(it: ListRenderItemInfo<AnimatableListItem>): React.ReactElement | null {
        const possibleDragStyles = this.getDragItemStyles(it);

        return <Animated.View style={possibleDragStyles}>
            <View style={{opacity: 1}}
                  onLayout={({nativeEvent}) => {
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
            </View>
        </Animated.View>;
    }

    private renderDraggedItem() {
        const styles = this.state.activeItemMeasures
            ? {
                width: this.state.activeItemMeasures.width,
                height: this.state.activeItemMeasures.height,
                opacity: this.state.activeDraggingItem.item.itemPosition.interpolate({
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
                    dragStart: (ev) => {}
                })}
            </Animated.View>;
    }

    private getDragItemStyles(item: ListRenderItemInfo<AnimatableListItem>) {
        return [
            {
                opacity: item.item.itemPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                    extrapolate: 'clamp'
                }),
                transform: [
                    {
                        scale: item.item.itemPosition.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.9],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }
        ];
    }

    private dragStart(it: ListRenderItemInfo<AnimatableListItem>, ev: GestureResponderEvent) {
        // get it relative to screen position
        // scale it to 0.8
        // set pan responder to act
        // on pan responder move update list view scroll position and it position to be the same relative on the screen
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

            this.draggingAnimationRef = Animated.timing(it.item.itemPosition, {
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
                ref.measure((x, y, width, height, pageX, pageY) => {
                    this._containerOffset = pageY;
                    this._containerSize = height;
                });
            }, 50);
        }
    };
}
