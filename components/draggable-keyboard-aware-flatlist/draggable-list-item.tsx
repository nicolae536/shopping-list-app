import React, {PureComponent} from 'react';
import {Animated, GestureResponderEvent, ListRenderItemInfo, Text, View} from 'react-native';
import {NATIVE_BASE_THEME} from '../../styles/variables';
import {AnimatableListItem, IDraggableItem} from './draggable-list.models';

export class DraggableListItem extends PureComponent<{
    itemDef: ListRenderItemInfo<AnimatableListItem>,
    dropItemPlaceholder: string;
    setItemRef(ref: any);
    renderItem(item: IDraggableItem);
    onDragStart(item: ListRenderItemInfo<AnimatableListItem>, event: GestureResponderEvent);
}, any> {

    constructor(props, state) {
        super(props, state);
        this.state = {};
    }

    render() {
        const possibleDragStyles = this.getDragItemStyles(this.props.itemDef);

        return <View onLayout={({nativeEvent}) => {
        }}
                     ref={ref => {
                         this.props.setItemRef(ref);
                     }}>
            {this.renderSpacerTop(this.props.itemDef)}
            <View style={{overflow: 'hidden'}}>
                <Animated.View style={possibleDragStyles}>
                    {this.props.renderItem({
                        index: this.props.itemDef.index,
                        item: this.props.itemDef.item.itemRef,
                        separators: this.props.itemDef.separators,
                        dragStart: (event: GestureResponderEvent) => {
                            this.props.onDragStart(this.props.itemDef, event);
                        }
                    })}
                </Animated.View>
            </View>
            {this.renderSpacerBottom(this.props.itemDef)}
        </View>;
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

    private renderSpacerTop(it: ListRenderItemInfo<AnimatableListItem>) {
        return <Animated.View style={{
            height: it.item.isItemHoveredTop.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 65],
                extrapolate: 'clamp'
            }),
            overflow: 'hidden'
        }}>
            <View style={{
                flex: 1,
                borderWidth: 1,
                borderColor: NATIVE_BASE_THEME.variables.accordionBorderColor,
                margin: 5,
                borderStyle: 'dashed',
                borderRadius: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text>{this.props.dropItemPlaceholder}</Text>
            </View>
        </Animated.View>;
    }

    private renderSpacerBottom(it: ListRenderItemInfo<AnimatableListItem>) {
        return <Animated.View style={{
            height: it.item.isItemHoveredBottom.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 65],
                extrapolate: 'clamp'
            }),
            overflow: 'hidden'
        }}>
            <View style={{
                flex: 1,
                borderWidth: 1,
                borderColor: NATIVE_BASE_THEME.variables.accordionBorderColor,
                margin: 5,
                borderStyle: 'dashed',
                borderRadius: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text>{this.props.dropItemPlaceholder}</Text>
            </View>
        </Animated.View>;
    }
}
