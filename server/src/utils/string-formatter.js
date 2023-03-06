export const trimText = (text, maxLength) => {
    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, text.lastIndexOf(' ', maxLength)).replace(/,\s*$/, "") + '...';
}