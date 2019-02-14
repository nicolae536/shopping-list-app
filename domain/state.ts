import {AsyncStorage} from 'react-native';
import {StateObserver, IExtendedListener, IListener} from './stateObserver';
import {TodoListableItem} from './todoItem';


export class AppState {
    loadingData: boolean = true;
    items: TodoListableItem[] = [];

    _listeners: IExtendedListener<any>[] = [];

    constructor() {
        AsyncStorage.getItem('@ItemsStore').then(store => {
            this.deserializeAndNotify(store);
        }).catch(e => {
            this.deserializeAndNotify(null);
        });
    }

    select<T>(selector: (state: AppState) => T) {
        return new StateObserver<T>(selector, this) as IListener<T>;
    }

    findItem(uuid: string) {
        for (const it of this.items) {
            if (it.uuid === uuid) {
                return it;
            }
        }

        return new TodoListableItem();
    }

    updateOrPushItem(activeItem: TodoListableItem) {
        for (let idx = 0; idx < this.items.length; idx++) {
            if (this.items[idx].uuid === activeItem.uuid) {
                this.items[idx] = activeItem;
                this.items = [...this.items];
                this.updateListeners();
                AsyncStorage.setItem('@ItemsStore', JSON.stringify(this.getStoreForSerialize()));
                return;
            }
        }

        this.items = [...this.items];
        this.items.push(activeItem);
        AsyncStorage.setItem('@ItemsStore', JSON.stringify(this.getStoreForSerialize()));
        this.updateListeners();
    }

    private updateListeners() {
        console.log('notify-observers');
        this._listeners.forEach(l => l.notifyObservers());
    }

    private getStoreForSerialize() {
        return {
            items: this.items
        };
    }

    private deserializeAndNotify(store) {
        this.loadingData = false;
        if (!store) {
            this.updateListeners();
            return;
        }

        const data = JSON.parse(store);
        this.items = Array.isArray(data.items) ? data.items.map(it => TodoListableItem.from(it)) : [];
        console.log(this);
        this.updateListeners();
    }
}

export const appState = new AppState();