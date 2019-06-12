import React, {Component} from 'react';
import {Animated, ListRenderItemInfo, PanResponder, PanResponderInstance, View, Dimensions} from 'react-native';
import {KeyboardAwareFlatList, KeyboardAwareFlatListProps} from 'react-native-keyboard-aware-scroll-view';

interface IDraggableItem extends ListRenderItemInfo<any> {
    dragStart(): void;
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
            onStartShouldSetPanResponder: (e, g) => {
                if (!!this.state.activeDraggingItem) {
                    Animated.timing(this.state.activeDraggingItem.item.itemYPosition, {
                        duration: 5,
                        toValue: this.getPosition(g)
                    });
                    return true;
                }

                return false;
            },
            onMoveShouldSetPanResponder: () => !!this.state.activeDraggingItem,
            onMoveShouldSetPanResponderCapture: () => !!this.state.activeDraggingItem,
            onPanResponderGrant: (e, g) => {
                console.log('pan-responder');
                Animated.timing(this.state.activeDraggingItem.item.itemYPosition, {
                    duration: 5,
                    toValue: this.getPosition(g)
                });
            },
            onPanResponderMove: (e, g) => {
                Animated.timing(this.state.activeDraggingItem.item.itemYPosition, {
                    duration: 5,
                    toValue: this.getPosition(g)
                });
                // this._flatListRef.
                // make item follow the figner using absolute positioning
                // scroll list up/down using flatlist ref
                // consider creating drop slot on 2 items intersections
            },
            onPanResponderEnd: (e, g) => {
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
        return g.moveY - this._containerOffset;
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
                    dragStart: () => {
                        this.dragStart(it);
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
                transform: [
                    {scale: 0.8},
                    {
                        translateY: this.state.activeDraggingItem.item.itemYPosition.interpolate({
                            inputRange: [0, Dimensions.get('window').height],
                            outputRange: [this._containerOffset, this._containerOffset + this._containerSize],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            } : {};

        return !this.state.activeDraggingItem
            ? null
            : <Animated.View style={{
                position: 'absolute',
                ...styles
            }}>
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
                opacity: 1,
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

    private dragStart(it: ListRenderItemInfo<AnimatableListItem>) {
        // get it relative to screen position
        // scale it to 0.8
        // set pan responder to act
        // on pan responder move update list view scroll position and it position to be the same relative on the screen
        if (this.draggingAnimationRef) {
            this.draggingAnimationRef.stop();
            this.setState({
                activeItemMeasures: null,
                activeDraggingItem: null
            });
        }

        !!this._localRefs[it.index] && this._localRefs[it.index].measure((x, y, width, height, pageX, pageY) => {
            this.draggingAnimationRef = Animated.timing(it.item.itemPosition, {
                toValue: 1,
                duration: 100
            });


            this.draggingAnimationRef.start(() => {
                it.item.itemYPosition.setValue(pageY);
                this.setState({
                    activeItemMeasures: {
                        x, y, width, height, pageX, pageY
                    },
                    activeDraggingItem: it
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