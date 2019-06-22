import React, {Component} from 'react';
import {Keyboard, EmitterSubscription, KeyboardEventListener, Animated} from 'react-native';

export class KeyboardSpacer extends Component<{keyboardVerticalOffset?: number}, { keyboardHeight: Animated.Value }> {
    private keyboardDidShowListener: EmitterSubscription;
    private keyboardDidHideListener: EmitterSubscription;

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
        Animated.timing(this.state.keyboardHeight, {
            toValue: 0,
            duration: 100,
            delay: 50
        }).start();
    };

    private _keyboardDidShow: KeyboardEventListener = (e) => {
        const keyboardHeight = e.endCoordinates.height;
        console.log('keyboardHeight', keyboardHeight);
        Animated.timing(this.state.keyboardHeight, {
            toValue: keyboardHeight - (this.props.keyboardVerticalOffset || 45),
            duration: 100,
            delay: 50
        }).start();
    };
}