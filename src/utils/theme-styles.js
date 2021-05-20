export function logoBackground(theme) {
    if (!theme) return {};
    return {
        backgroundColor: theme.color_logo_background ? theme.color_logo_background : theme.color_theme,
        color: theme.color_logo_background ? theme.color_text_on_logo_background : theme.color_text_on_theme,
        borderColor: theme.color_logo_accent
    };
}
export function logoBackground1(item) {
    if (!item || !item.theme) return {};
    return logoBackground(item.theme);
}

export function themeBackground(theme) {
    if (!theme) return {};
    return {
        backgroundColor: theme.color_theme,
        color: theme.color_text_on_theme
    };
}
export function themeBackground1(item) {
    if (!item || !item.theme) return {};
    return themeBackground(item.theme);
}
