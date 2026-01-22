enum Visibility {
    PUBLIC = "+",
    PRIVATE = "-",
    DEFAULT = "*",
    PROTECTED = "#",
    PACKAGE = "~"
}

/**
 * Determines and returns the visibility level as a string based on the provided type.
 *
 * @param {number | string} type - The visibility type, which can be a number or a string.
 * @returns {string} The visibility level corresponding to the provided type.
 *                   Possible return values are "public", "private", "protected", or an empty string.
 */
export const getVisibility = (type: number | string) => {
    switch (type) {
        case Visibility.PACKAGE:
        case Visibility.DEFAULT:
            return ""
        case Visibility.PUBLIC:
            return "public"
        case Visibility.PRIVATE:
            return "private"
        case Visibility.PROTECTED:
            return "protected"
        default:
            return "private"
    }
}

export default Visibility;

