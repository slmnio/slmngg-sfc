export function logoBackground(theme) {
    if (!theme) return {};
    const style = {
        backgroundColor: theme.color_logo_background ? theme.color_logo_background : theme.color_theme,
        color: theme.color_logo_background ? theme.color_text_on_logo_background : theme.color_text_on_theme,
        borderColor: theme.color_logo_accent
    };
    if (!style.backgroundColor) delete style.backgroundColor;
    if (!style.color) delete style.color;
    if (!style.borderColor) delete style.borderColor;
    return style;
}
export function logoBackground1(item) {
    if (!item || !item.theme) return {};
    return logoBackground(item.theme);
}

export function themeBackground(theme) {
    if (!theme) return {};
    const style = {
        backgroundColor: theme.color_theme || theme.color_logo_background,
        color: theme.color_text_on_theme || theme.color_alt || theme.color_text_on_logo_background,
        borderColor: theme.color_accent || theme.color_logo_accent
    };
    if (!style.backgroundColor) delete style.backgroundColor;
    if (!style.color) delete style.color;
    if (!style.borderColor) delete style.borderColor;
    return style;
}
export function themeBackground1(item) {
    if (!item || !item.theme) return {};
    return themeBackground(item.theme);
}
export function heroRecolorColors(theme) {
    return {
        primary: theme.color_hero_recolor_primary || logoBackground(theme).backgroundColor,
        secondary: theme.color_hero_recolor_secondary || logoBackground(theme).borderColor || logoBackground(theme).color
    };
}
