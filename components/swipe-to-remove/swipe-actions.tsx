import {MaterialIcons} from '@expo/vector-icons';
import {View} from 'native-base';
import {default as React, PureComponent} from 'react';
import {Animated, GestureResponderEvent, PanResponder, PanResponderGestureState, PanResponderInstance} from 'react-native';
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
    animationDuration?: number;
    enableSwipe?: boolean;
    enableSwipeLeft?: boolean;
    enableSwipeRight?: boolean;
    onSwipeEnd?: () => void;
    onSwipeLeftEnd?: () => void;
    onSwipeRightEnd?: () => void;
}

interface SwipeToRemoveState {
    position: Animated.ValueXY;
    animated: Animated.Value;
    onSwipeBackgroundColor: string;
    animationDuration: number;
    enableSwipe: boolean;
    enableSwipeLeft: boolean;
    enableSwipeRight: boolean;
}

export class SwipeActions extends PureComponent<SwipeToRemoveProps, SwipeToRemoveState> {
    animatedRef: any;
    private _panResponder: PanResponderInstance;
    private currentPosition: number;

    constructor(props, state) {
        super(props, state);

        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: (e, g) => this.onMoveShouldSetPanResponderCapture(e, g),
            onMoveShouldSetPanResponder: (e, g) => this.onMoveShouldSetPanResponder(e, g),
            onPanResponderMove: (ev, gesture) => this.onPanResponderMove(ev, gesture),
            onPanResponderEnd: () => this.onPanResponderEnd()
        });

        this.state = {
            position: new Animated.ValueXY(),
            animated: new Animated.Value(0),
            ...this.swipeSettingsFromProps(this.props)
        };
    }

    componentWillReceiveProps(nextProps: Readonly<SwipeToRemoveProps>, nextContext: any): void {
        this.setState(this.swipeSettingsFromProps(nextProps));
    }

    render() {
        let animatedBackground = {
            backgroundColor: this.state.animated.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [this.props.elementSwipingBackgroundColor, this.props.elementBackgroundColor,
                    this.props.elementSwipingBackgroundColor],
                extrapolate: 'clamp'
            })
        };
        let animatedViewStyle = [
            {
                backgroundColor: this.props.elementBackgroundColor,
                minWidth: this.props.elementWidth,
                maxWidth: this.props.elementWidth
            },
            {
                transform: [
                    {
                        translateX: this.state.animated.interpolate({
                            inputRange: [-1, 1],
                            outputRange: [-this.props.elementWidth, this.props.elementWidth],
                            extrapolate: 'clamp'
                        })
                    }
                ]
            }
        ];


        return <View style={SwipeActionsStyles.MAIN_CONTAINER}>
            <Animated.View style={[SwipeActionsStyles.DRAGGABLE_BACKGROUND, {backgroundColor: this.state.onSwipeBackgroundColor}]}>
                <View style={SwipeActionsStyles.DRAGGABLE_BACKGROUND_CONTENT}>
                    <MaterialIcons color={this.props.actionIconSwipeRightColor || this.props.actionIconColor}
                                   size={32}
                                   name={this.props.actionIconSwipeRight || this.props.actionIcon}/>
                    <MaterialIcons color={this.props.actionIconSwipeLeftColor || this.props.actionIconColor}
                                   size={32}
                                   name={this.props.actionIconSwipeLeft || this.props.actionIcon}/>
                </View>
            </Animated.View>
            <Animated.View ref={view => this.animatedRef = view} style={animatedViewStyle} {...this._panResponder.panHandlers}>
                {this.props.children}
            </Animated.View>
        </View>;
    }

    private onPanResponderMove(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        this.currentPosition = gesture.dx / (this.props.elementWidth);
        Animated.timing(this.state.animated, {
            toValue: gesture.dx / (this.props.elementWidth),
            duration: 5
        }).start();
    }

    private onPanResponderEnd() {
        const wasFullSwipe = Math.abs(this.currentPosition) > 1 / 2.5;
        if (!wasFullSwipe) {
            Animated.timing(this.state.animated, {
                toValue: 0,
                duration: this.state.animationDuration
            }).start(() => {
                this.setState({
                    onSwipeBackgroundColor: this.props.elementBackgroundColor || ''
                });
            });
            this.currentPosition = 0;
            return;
        }

        Animated.timing(this.state.animated, {
            toValue: this.currentPosition > 0 ? 1 : -1,
            duration: this.state.animationDuration
        }).start(result => {
            this.currentPosition = this.currentPosition / this.currentPosition;
            if (this.props.onSwipeEnd) {
                this.props.onSwipeEnd();
            }

            if (this.currentPosition > 0 && this.props.onSwipeRightEnd) {
                this.props.onSwipeRightEnd();
            }

            if (this.currentPosition > 0 && this.props.onSwipeLeftEnd) {
                this.props.onSwipeLeftEnd();
            }
        });
    }

    private onMoveShouldSetPanResponder(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        const isThresholdExceeded = Math.abs(gesture.dx) > 10;
        return (isThresholdExceeded && this.state.enableSwipe) ||
            (isThresholdExceeded && this.state.enableSwipeLeft && gesture.dx < 0) ||
            (isThresholdExceeded && this.state.enableSwipeRight && gesture.dx > 0);
    }

    private onMoveShouldSetPanResponderCapture(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
        if (this.state.onSwipeBackgroundColor !== this.props.elementSwipingBackgroundColor) {
            this.setState({
                onSwipeBackgroundColor: this.props.elementSwipingBackgroundColor || ''
            });
        }

        const isThresholdExceeded = Math.abs(gesture.dx) > 10;
        return (isThresholdExceeded && this.state.enableSwipe) ||
            (isThresholdExceeded && this.state.enableSwipeLeft && gesture.dx < 0) ||
            (isThresholdExceeded && this.state.enableSwipeRight && gesture.dx > 0);
    }

    private swipeSettingsFromProps(nextProps: Readonly<SwipeToRemoveProps>) {
        const enableSwipeValue = !!nextProps.enableSwipe;
        const enableSwipeLeftValue = !!nextProps.enableSwipeLeft;
        const enableSwipeRightValue = !!nextProps.enableSwipeRight;
        const isSwipeEnabled = nextProps.hasOwnProperty('enableSwipe') ? enableSwipeValue : true;

        return {
            onSwipeBackgroundColor: nextProps.elementBackgroundColor || '',
            enableSwipe: isSwipeEnabled,
            animationDuration: nextProps.animationDuration || 250,
            enableSwipeLeft: nextProps.hasOwnProperty('enableSwipeLeft') ? enableSwipeLeftValue : isSwipeEnabled,
            enableSwipeRight: nextProps.hasOwnProperty('enableSwipeRight') ? enableSwipeRightValue : isSwipeEnabled
        };
    }
}
