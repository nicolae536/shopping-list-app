import React, {PureComponent} from 'react';
import {Animated, View, GestureResponderEvent, ListRenderItemInfo} from 'react-native';
import {AnimatableListItem, IDraggableItem} from './draggable-list.models';

export class DraggableListItem extends PureComponent<{
    itemDef: ListRenderItemInfo<AnimatableListItem>,
    renderItem(item: IDraggableItem);
    onDragStart(item: ListRenderItemInfo<AnimatableListItem>, event: GestureResponderEvent);
    onRefMeasureUpdate(itemDef: ListRenderItemInfo<AnimatableListItem>);
}, any> {
    private viewRef: any;

    constructor(props, state) {
        super(props, state);
        this.state = {};
    }

    render() {
        const possibleDragStyles = this.getDragItemStyles(this.props.itemDef);

        return <Animated.View style={possibleDragStyles}>
            {this.renderSpacer(this.props.itemDef)}
            <View onLayout={({nativeEvent}) => {
            }}
                  ref={ref => {
                      this.viewRef = ref;
                  }}>
                {this.props.renderItem({
                    index: this.props.itemDef.index,
                    item: this.props.itemDef.item.itemRef,
                    separators: this.props.itemDef.separators,
                    dragStart: (event: GestureResponderEvent) => {
                        this.props.onDragStart(this.props.itemDef, event);
                    }
                })}
                {this.renderSpacerBottom(this.props.itemDef)}
            </View>
        </Animated.View>;
    }

    componentDidMount(): void {
        console.log('component-did-mount');
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