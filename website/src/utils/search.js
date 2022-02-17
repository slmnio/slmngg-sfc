function unleet(text) {
    const charMap = {
        // These seem to be the common special chars used in overwatch names the diacritics trick doesn't catch
        // From https://www.reddit.com/r/Overwatch/comments/619jpf/guide_how_to_change_your_battletag_to_use_the/
        æ: "ae",
        ɓ: "b",
        ƅ: "b",
        ƃ: "b",
        ƈ: "c",
        ɔ: "c",
        đ: "d",
        ǝ: "e",
        ɛ: "e",
        ƒ: "f",
        ɠ: "g",
        ƕ: "h",
        ħ: "h",
        ɨ: "i",
        ƙ: "k",
        ĸ: "k",
        ŀ: "l",
        ŋ: "n",
        ø: "o",
        ŧ: "t",
        ɣ: "v",
        // Normalize numbers
        0: "o",
        1: "i",
        2: "a",
        3: "e",
        4: "a"

    };

    let unleetText = text
        // Split the diacritics into separate characters and remove them
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase();

    for (const key in charMap) {
        // Replace all the other characters from the charMap
        console.log(key);
        unleetText = unleetText.replaceAll(new RegExp(key, "g"), charMap[key]);
    }

    return unleetText;
}

export function searchInCollection(collection, search, key) {
    if (!search) return collection;
    const lowerSearch = search.toLocaleLowerCase();
    const unleetSearch = unleet(search);

    return collection.filter(c => c[key] && (c[key].toLocaleLowerCase().includes(lowerSearch) || unleet(c[key]).includes(unleetSearch)));
}
