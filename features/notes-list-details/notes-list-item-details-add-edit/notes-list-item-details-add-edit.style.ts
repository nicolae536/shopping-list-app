import {StyleSheet} from 'react-native';
import {NATIVE_BASE_THEME} from '../../../styles/variables';

export const NotesListItemDetailsAddEditStyle = StyleSheet.create({
  MAIN_CONTAINER: {
    flexDirection: 'row', alignItems: 'center'
  },
  MAIN_INNER_CONTAINER: {
    flexDirection: 'row', alignItems: 'center'
  },
  INPUT: {
    flex: 1,
    flexShrink: 1,
    marginTop: 7,
    marginBottom: 7
  },
  BUTTON_STYLE: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    padding: 0,
    minHeight: '100%'
  },
  DRAG_HANDLE: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 64,
  },
  DRAG_HANDLE_CONTAINER: {
    paddingRight: 16
  },
  DRAG_HANDLE_ICON: {
    color: NATIVE_BASE_THEME.variables.checkboxBgColor
  },
  LIST_ITEM: {
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0
  },
  CHECK_BOX: {
    marginLeft: -16,
    marginTop: 6
  }
});
