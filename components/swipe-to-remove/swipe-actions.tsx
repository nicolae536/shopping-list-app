import {MaterialIcons} from '@expo/vector-icons';
import {View} from 'native-base';
import {PureComponent, default as React} from 'react';
import {Animated, PanResponderInstance, PanResponder, GestureResponderEvent, PanResponderGestureState} from 'react-native';
import {SwipeActionsStyles} from './swipe-actions.styles';

interface SwipeToRemoveProps {
    elementWidth: number;
    elementBackgroundColor?: string;
    elementSwipingBackgroundColor?: string;
    actionIcon?: string;
    actionIconColor?: string;
    actionIconSwipeLeft?: string;
    actionIconSwipeLeftColor?: string;
    actionIconSwipeRight?: string;
    actionIconSwipeRightColor?: string;
    onSwipeEnd?: () => void;
    onSwipeLeftEnd?: () => void;
    onSwipeRightEnd?: () => void;
}

interface SwipeToRemoveState {
    position: Animated.ValueXY;
    onSwipeBackgroundColor: string;
}

export class SwipeActions extends PureComponent<SwipeToRemoveProps, SwipeToRemoveState> {
    private _panResponder: PanResponderInstance;

    constructor(props, state) {
        super(props, state);

        const position = new Animated.ValueXY();
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (e, g) => this.onMoveShouldSetPanResponderCapture(e, g),
            onMoveShouldSetPanResponder: (e, g) => this.onMoveShouldSetPanResponder(e, g),
            onPanResponderMove: (ev, gesture) => this.onPanResponderMove(ev, gesture),
            onPanResponderEnd: () => this.onPanResponderEnd()
        });

        this.state = {
            position: position,
            onSwipeBackgroundColor: this.props.elementBackgroundColor || ''
        };
    }

    render() {
        return <View style={SwipeActionsStyles.MAIN_CONTAINER}>
            <View style={[SwipeActionsStyles.DRAGGABLE_BACKGROUND, {backgroundColor: this.state.onSwipeBackgroundColor}]}>
                <View style={SwipeActionsStyles.DRAGGABLE_BACKGROUND_CONTENT}>
                    <MaterialIcons color={this.props.actionIconSwipeRightColor || this.props.actionIconColor}
                                   size={32}
                                   name={this.props.actionIconSwipeRight || this.props.actionIcon}/>
                    <MaterialIcons color={this.props.actionIconSwipeLeftColor || this.props.actionIconColor}
                                   size={32}
                                   name={this.props.actionIconSwipeLeft || this.props.actionIcon}/>
                </View>
            </View>
            <Animated.View style={[{
                backgroundColor: this.props.elementBackgroundColor,
                minWidth: this.props.elementWidth,
                maxWidth: this.props.elementWidth
            }, this.state.position.getLayout()]} {...this._panResponder.panHandlers}>
                {this.props.children}
            </Animated.View>
        </View>;
    }

    private onPanResponderMove(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        this.state.position.setValue({x: gesture.dx, y: 0});
    }

    private onPanResponderEnd() {
        const currentPosition = this.state.position.x['_value'];
        const wasFullSwipe = Math.abs(currentPosition) > this.props.elementWidth / 3;
        if (!wasFullSwipe) {
            this.state.position.setValue({x: 0, y: 0});
            return;
        }

        this.state.position.setValue({x: currentPosition > 0 ? this.props.elementWidth : -this.props.elementWidth, y: 0});
        if (this.props.onSwipeEnd) {
            this.props.onSwipeEnd();
        }

        if (currentPosition > 0 && this.props.onSwipeRightEnd) {
            this.props.onSwipeRightEnd();
        }

        if (currentPosition > 0 && this.props.onSwipeLeftEnd) {
            this.props.onSwipeLeftEnd();
        }
    }

    private onMoveShouldSetPanResponder(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        this.setState({
            onSwipeBackgroundColor: this.props.elementSwipingBackgroundColor || ''
        });
        return Math.abs(gesture.dx) > 3;
    }

    private onMoveShouldSetPanResponderCapture(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        return Math.abs(gesture.dx) > 5;
    }
}