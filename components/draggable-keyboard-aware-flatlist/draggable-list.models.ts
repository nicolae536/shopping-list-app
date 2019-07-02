import {ListRenderItemInfo, GestureResponderEvent, Animated} from 'react-native';
import {KeyboardAwareFlatListProps} from 'react-native-keyboard-aware-scroll-view';

export interface IDraggableItem extends ListRenderItemInfo<any> {
    dragStart(ev: GestureResponderEvent): void;
}

export interface IDraggableFlatListProps extends KeyboardAwareFlatListProps<any> {
    keyboardVerticalOffset?: number;
    dropItemPlaceholder?: string;
    onItemsDropped(it: any[]);

    renderItem(item: IDraggableItem);

    onKeyboardOpened?: () => void;
    onKeyboardClosed?: () => void;
}

export interface IDraggableFlatListState {
    activeDraggingItem: ListRenderItemInfo<AnimatableListItem>;
    activeItemMeasures: ItemMeasure;
    items: AnimatableListItem[];
}

export interface ItemMeasurableRef {
    measure: (callback: (x: number,
                         width: number,
                         y: number,
                         pageY: number,
                         pageX: number,
                         height: number) => void) => void
}

export interface ItemMeasure {
    x: number;
    width: number;
    y: number;
    pageY: number;
    pageX: number;
    height: number;
    isMeasured: boolean;
}

export class AnimatableListItem {
    public isItemDragged: Animated.Value;
    public itemYPosition: Animated.Value;
    public isItemHoveredTop: Animated.Value;
    public isItemHoveredBottom: Animated.Value;

    public hoverTopActive: boolean;
    public hoverBottomActive: boolean;

    constructor(public itemRef) {
        this.isItemDragged = new Animated.Value(0);
        this.itemYPosition = new Animated.Value(0);
        this.isItemHoveredTop = new Animated.Value(0);
        this.isItemHoveredBottom = new Animated.Value(0);
    }
}