import React, {Component} from 'react';
import {Keyboard, EmitterSubscription, KeyboardEventListener, Animated} from 'react-native';

export interface IKeyboardSpacer {
    keyboardVerticalOffset?: number;
    onKeyboardOpened?: () => void;
    onKeyboardClosed?: () => void;
}

export class KeyboardSpacer extends Component<IKeyboardSpacer, { keyboardHeight: Animated.Value }> {
    private keyboardDidShowListener: EmitterSubscription;
    private keyboardDidHideListener: EmitterSubscription;
    private closeAnimation: Animated.CompositeAnimation;
    private startAnimation: Animated.CompositeAnimation;

    constructor(props, state) {
        super(props, state);

        this.state = {
            keyboardHeight: new Animated.Value(0)
        };
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount(): void {
        Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
        Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    }

    render() {
        return <Animated.View style={{height: this.state.keyboardHeight}}/>;
    }

    private _keyboardDidHide: KeyboardEventListener = (e) => {
        if (this.startAnimation) {
            this.startAnimation.stop();
            this.startAnimation = null;
        }

        this.closeAnimation = Animated.timing(this.state.keyboardHeight, {
            toValue: 0,
            duration: 50
        });

        this.closeAnimation.start(() => {
            this.closeAnimation = null;

            if (this.props.onKeyboardClosed) {
                this.props.onKeyboardClosed();
            }
        });
    };

    private _keyboardDidShow: KeyboardEventListener = (e) => {
        const keyboardHeight = e.endCoordinates.height;

        if (this.closeAnimation) {
            this.closeAnimation.stop();
            this.closeAnimation = null;
        }

        this.startAnimation = Animated.timing(this.state.keyboardHeight, {
            toValue: keyboardHeight - (this.props.keyboardVerticalOffset || 45),
            duration: 150,
            delay: 150
        });

        this.startAnimation.start(() => {
            this.startAnimation = null;
            if (this.props.onKeyboardOpened) {
                this.props.onKeyboardOpened();
            }
        });
    };
}