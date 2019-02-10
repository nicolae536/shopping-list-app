// @ts-ignore
import getTheme from '../native-base-theme/components';
// @ts-ignore
import material from '../native-base-theme/variables/material';

export const STYLES = {
    getTheme,
    material,
    materialTheme: getTheme(material)
};