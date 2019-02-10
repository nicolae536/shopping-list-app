import {AppState} from './state';

export interface IListener<T> {
    subscribe(fn: (data: T) => void): { unSubscribe: () => void };
}

export interface IExtendedListener<T> extends IListener<T> {
    notifyObservers(): void;

    sendData: (data: T) => void;

    lastPushedValue: any;
}

export class StateObserver<T> implements IExtendedListener<T> {
    constructor(private selector: (state: AppState) => T,
                private appStateRef: AppState) {
    }

    lastPushedValue: any = 'INITIAL_VALUE';

    sendData(data: T) {
    };

    notifyObservers(): void {
        if (this.lastPushedValue === 'INITIAL_VALUE') {
            this.lastPushedValue = this.selector(this.appStateRef);
            this.sendData(this.lastPushedValue as T);
        }

        const newValue = this.selector(this.appStateRef);
        if (this.lastPushedValue !== newValue) {
            this.lastPushedValue = newValue;
            this.sendData(this.lastPushedValue as T);
        }
    }

    subscribe(fn: (data: T) => void): { unSubscribe: () => void } {
        this.sendData = (data) => {
            console.log('send-data-called', JSON.stringify(data));
            fn(data);
        };
        this.appStateRef._listeners.push(this);
        console.log(`new-observer`, this.appStateRef._listeners.length);

        return {
            unSubscribe: () => {
                this.sendData = () => {
                };
                this.appStateRef._listeners = this.appStateRef._listeners.filter(v => v !== this);
                console.log(`observer-removed`, this.appStateRef._listeners.length);
            }
        };
    }
}