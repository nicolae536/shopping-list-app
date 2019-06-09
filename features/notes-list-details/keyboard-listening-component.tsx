import {Component} from 'react';
import {Keyboard, EmitterSubscription} from 'react-native';

interface IKeyboardState {
    isKeyboardOpen: boolean;
}

export abstract class KeyboardListeningComponent<TProps, TState extends IKeyboardState> extends Component<TProps, TState> {
    private keyboardDidShowListener: EmitterSubscription;
    private keyboardDidHideListener: EmitterSubscription;

    constructor(pops, state) {
        super(pops, state);

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );

        if (this.componentWillUnmount instanceof Function) {
            const original = this.componentWillUnmount.bind(this);

            this.componentWillUnmount = () => {
                original();
                this.keyboardDidShowListener.remove();
                this.keyboardDidHideListener.remove();
            };
        }

    }

    onKeyboardOpen?(): void;

    onKeyboardClose?(): void;

    private _keyboardDidShow() {
        if (this.onKeyboardOpen instanceof Function) {
            this.onKeyboardOpen();
        }
        this.setState({
            isKeyboardOpen: true
        });
    }

    private _keyboardDidHide() {
        if (this.onKeyboardClose instanceof Function) {
            this.onKeyboardClose();
        }
        this.setState({
            isKeyboardOpen: false
        });
    }
}