/**
 * Determines and returns a hex color code string representing a specific category
 * or type of variable or object. The color is associated with commonly used data types,
 * collections, number representations, IO mechanisms, threading constructs, and more.
 *
 * @param {string} type - The type of the variable for which the color code is to be retrieved.
 *                        Examples include data types such as "int", "String", "List",
 *                        or constructs such as "Runnable", "Exception", etc.
 * @returns {string} A hex color code string that corresponds to the provided type or category.
 *                   If the type is unrecognized, a default color is returned.
 */
export const getColor = ( type: string ): string => {
    switch (type) {
        // Primitive integers
        case "int":
        case "long":
        case "short":
        case "byte":
            return "#e67e22"; // Orange

        // Floating-point numbers
        case "float":
        case "double":
            return "#1abc9c"; // Teal

        // Characters
        case "char":
            return "#9b59b6"; // Purple

        // Booleans
        case "boolean":
            return "#e74c3c"; // Red

        // Strings and text
        case "String":
        case "CharSequence":
        case "StringBuilder":
            return "#3498db"; // Blue

        // Collections
        case "List":
        case "ArrayList":
        case "Set":
        case "Map":
        case "Queue":
            return "#2ecc71"; // Green

        // Numbers
        case "BigInteger":
        case "BigDecimal":
        case "Number":
            return "#f39c12"; // Gold

        // Date and time
        case "LocalDate":
        case "LocalDateTime":
        case "Date":
        case "Calendar":
            return "#00bcd4"; // Cyan

        // IO
        case "InputStream":
        case "OutputStream":
        case "Reader":
        case "Writer":
            return "#8a9899"; // Gray

        // Threading
        case "Thread":
        case "Runnable":
        case "ExecutorService":
            return "#c0392b"; // Dark red

        // Void/null
        case "void":
        case "null":
            return "#737375"; // Light gray

        // Interfaces
        case "Comparable":
        case "Serializable":
        case "Cloneable":
            return "#8e44ad"; // Violet

        // Exceptions
        case "Exception":
        case "IOException":
        case "RuntimeException":
            return "#ff6b6b"; // Bright red

        // Annotations
        case "@Override":
        case "@Nullable":
        case "@Test":
            return "#f1c40f"; // Yellow

        default:
            return "#b4b8b9ff"; // Default light color for Object or unknown types
    }
};
