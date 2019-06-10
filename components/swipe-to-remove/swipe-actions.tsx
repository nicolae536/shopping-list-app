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
  enableSwipe?: boolean;
  enableSwipeLeft?: boolean;
  enableSwipeRight?: boolean;
  onSwipeEnd?: () => void;
  onSwipeLeftEnd?: () => void;
  onSwipeRightEnd?: () => void;
}

interface SwipeToRemoveState {
  position: Animated.ValueXY;
  onSwipeBackgroundColor: string;
  enableSwipe: boolean;
  enableSwipeLeft: boolean;
  enableSwipeRight: boolean;
}

export class SwipeActions extends PureComponent<SwipeToRemoveProps, SwipeToRemoveState> {
  animatedRef: any;
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
      ...this.swipeSettingsFromProps(this.props)
    };
  }

  componentWillReceiveProps(nextProps: Readonly<SwipeToRemoveProps>, nextContext: any): void {
    this.setState(this.swipeSettingsFromProps(nextProps));
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
      <Animated.View ref={view => this.animatedRef = view} style={[{
        backgroundColor: this.props.elementBackgroundColor,
        minWidth: this.props.elementWidth,
        maxWidth: this.props.elementWidth,
      }, this.state.position.getLayout()]} {...this._panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    </View>;
  }

  private onPanResponderMove(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
    Animated.timing(this.state.position, {
      toValue: {x: gesture.dx, y: 0},
      duration: 15
    }).start();
  }

  private onPanResponderEnd() {
    const currentPosition = this.state.position.x['_value'];
    const wasFullSwipe = Math.abs(currentPosition) > this.props.elementWidth / 3;
    this.setState({
      onSwipeBackgroundColor: this.props.elementBackgroundColor || ''
    });
    if (!wasFullSwipe) {
      Animated.timing(this.state.position, {
        toValue: {x: 0, y: 0},
        duration: 250
      }).start();
      return;
    }

    Animated.parallel([
      Animated.timing(this.state.position, {
        toValue: {x: currentPosition > 0 ? this.props.elementWidth : -this.props.elementWidth, y: 0},
        duration: 250
      }),
    ]).start(result => {
      if (this.props.onSwipeEnd) {
        this.props.onSwipeEnd();
      }

      if (currentPosition > 0 && this.props.onSwipeRightEnd) {
        this.props.onSwipeRightEnd();
      }

      if (currentPosition > 0 && this.props.onSwipeLeftEnd) {
        this.props.onSwipeLeftEnd();
      }
    });
  }

  private onMoveShouldSetPanResponder(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
    this.setState({
      onSwipeBackgroundColor: this.props.elementSwipingBackgroundColor || ''
    });
    const isThresholdExceeded = Math.abs(gesture.dx) > 10;
    return (isThresholdExceeded && this.state.enableSwipe) ||
      (isThresholdExceeded && this.state.enableSwipeLeft && gesture.dx < 0) ||
      (isThresholdExceeded && this.state.enableSwipeRight && gesture.dx > 0);
  }

  private onMoveShouldSetPanResponderCapture(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
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
      enableSwipeLeft: nextProps.hasOwnProperty('enableSwipeLeft') ? enableSwipeLeftValue : isSwipeEnabled,
      enableSwipeRight: nextProps.hasOwnProperty('enableSwipeRight') ? enableSwipeRightValue : isSwipeEnabled
    };
  }
}
