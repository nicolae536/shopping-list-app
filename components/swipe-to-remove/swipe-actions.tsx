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
  animated: Animated.Value;
  leftIconOpacity: number;
  rightIconOpacity: number;
  onSwipeBackgroundColor: string;
  animationDuration: number;
  enableSwipe: boolean;
  enableSwipeLeft: boolean;
  enableSwipeRight: boolean;
}

export class SwipeActions extends PureComponent<SwipeToRemoveProps, SwipeToRemoveState> {
  animatedRef: any;
  private _panResponder: PanResponderInstance;
  private currentPositionDx: number;

  constructor(props, state) {
    super(props, state);

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (e, g) => this.onMoveShouldSetPanResponderCapture(e, g),
      onMoveShouldSetPanResponder: (e, g) => this.onMoveShouldSetPanResponder(e, g),
      onPanResponderMove: (ev, gesture) => this.onPanResponderMove(ev, gesture),
      onPanResponderEnd: () => this.onPanResponderEnd()
    });

    this.state = {
      leftIconOpacity: 1,
      rightIconOpacity: 1,
      animated: new Animated.Value(0),
      ...this.getSwipeSettingsFromProps(this.props)
    };
  }

  componentWillReceiveProps(nextProps: Readonly<SwipeToRemoveProps>, nextContext: any): void {
    this.setState(this.getSwipeSettingsFromProps(nextProps));
  }

  render() {
    let swipeAnimationStyles = this.getSwipeAnimationStyles();


    return <View style={SwipeActionsStyles.MAIN_CONTAINER}>
      <Animated.View style={[SwipeActionsStyles.DRAGGABLE_BACKGROUND, {backgroundColor: this.state.onSwipeBackgroundColor}]}>
        <View style={SwipeActionsStyles.DRAGGABLE_BACKGROUND_CONTENT}>
          <MaterialIcons color={this.props.actionIconSwipeRightColor || this.props.actionIconColor}
                         size={32}
                         style={{opacity: this.state.leftIconOpacity}}
                         name={this.props.actionIconSwipeRight || this.props.actionIcon}/>
          <MaterialIcons color={this.props.actionIconSwipeLeftColor || this.props.actionIconColor}
                         size={32}
                         style={{opacity: this.state.rightIconOpacity}}
                         name={this.props.actionIconSwipeLeft || this.props.actionIcon}/>
        </View>
      </Animated.View>
      <Animated.View ref={view => this.animatedRef = view} style={swipeAnimationStyles} {...this._panResponder.panHandlers}>
        {this.props.children}
      </Animated.View>
    </View>;
  }

  private onPanResponderMove(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
    this.updateCurrentPosition(gesture);
  }

  private getSwipeSettingsFromProps(nextProps: Readonly<SwipeToRemoveProps>) {
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

  private onPanResponderEnd() {
    const wasFullSwipe = Math.abs(this.currentPositionDx) > 1 / 2.5;
    if (!wasFullSwipe) {
      this.revertElementToOriginalState();
      return;
    }

    this.swipeElementOffTheScreen();
  }

  private getSwipeAnimationStyles() {
    return [
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
  }

  private revertElementToOriginalState() {
    Animated.timing(this.state.animated, {
      toValue: 0,
      duration: this.state.animationDuration
    }).start(() => {
      this.updateSwipingBackgroundColor(this.props.elementBackgroundColor);
      this.currentPositionDx = 0;
    });
  }

  private swipeElementOffTheScreen() {
    Animated.timing(this.state.animated, {
      toValue: this.currentPositionDx > 0 ? 1 : -1,
      duration: this.state.animationDuration
    }).start(result => {
      this.callSwipeEndOutputs();
      this.currentPositionDx = this.currentPositionDx / this.currentPositionDx;
    });
  }

  private callSwipeEndOutputs() {
    if (this.props.onSwipeEnd) {
      this.props.onSwipeEnd();
    }

    if (this.currentPositionDx > 0 && this.props.onSwipeRightEnd) {
      this.props.onSwipeRightEnd();
    }

    if (this.currentPositionDx > 0 && this.props.onSwipeLeftEnd) {
      this.props.onSwipeLeftEnd();
    }
  }

  private onMoveShouldSetPanResponder(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
    this.updateSwipingBackgroundColor(this.props.elementSwipingBackgroundColor);
    return this.didUserSwipeEnough(gesture);
  }

  private onMoveShouldSetPanResponderCapture(ev: GestureResponderEvent, gesture: PanResponderGestureState) {
    return this.didUserSwipeEnough(gesture);
  }

  private updateSwipingBackgroundColor(color: string) {
    if (this.state.onSwipeBackgroundColor !== color) {
      this.setState({
        onSwipeBackgroundColor: color || ''
      });
    }
  }

  private didUserSwipeEnough(gesture: PanResponderGestureState) {
    const isThresholdExceeded = Math.abs(gesture.dx) > 10;
    return (isThresholdExceeded && this.state.enableSwipe) ||
      (isThresholdExceeded && this.state.enableSwipeLeft && gesture.dx < 0) ||
      (isThresholdExceeded && this.state.enableSwipeRight && gesture.dx > 0);
  }

  private updateCurrentPosition(gesture: PanResponderGestureState) {
    this.currentPositionDx = gesture.dx / (this.props.elementWidth);

    Animated.timing(this.state.animated, {
      toValue: this.currentPositionDx,
      duration: 5
    }).start();

    let leftIconOpacity = this.currentPositionDx > 0 ? 1 : 0;
    let rightIconOpacity = this.currentPositionDx < 0 ? 1 : 0;

    if (this.state.leftIconOpacity !== leftIconOpacity) {
      this.setState({
        leftIconOpacity,
      });
    }
    if (this.state.rightIconOpacity !== rightIconOpacity) {
      this.setState({
        rightIconOpacity,
      });
    }

  }
}
