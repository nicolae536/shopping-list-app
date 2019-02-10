import {StateObserver, IExtendedListener, IListener} from './stateObserver';
import {ListItem} from './todoItem';

export class AppState {
    items: ListItem[] = [];

    _listeners: IExtendedListener<any>[] = [];

    select<T>(selector: (state: AppState) => T) {
        return new StateObserver<T>(selector, this) as IListener<T>;
    }

    findItem(uuid: string) {
        for (const it of this.items) {
            if (it.uuid === uuid) {
                return it;
            }
        }

        return new ListItem();
    }

    updateOrPushItem(activeItem: ListItem) {
        for (let idx = 0; idx < this.items.length; idx++) {
            if (this.items[idx].uuid === activeItem.uuid) {
                this.items[idx] = activeItem;
                this.items = [...this.items];
                this.updateListeners();
                return;
            }
        }

        this.items = [...this.items];
        this.items.push(activeItem);
        this.updateListeners();
    }

    private updateListeners() {
        console.log('notify-observers');
        this._listeners.forEach(l => l.notifyObservers());
    }
}

export const appState = new AppState();