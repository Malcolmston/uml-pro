import React from "react";

/**
 * Abstract base class for all UML object creator components.
 * Provides shared functionality for validation, ID generation, and event handling.
 */
export default abstract class ObjectCreator<P = object, S = object> extends React.Component<P, S> {
    idRef: { current: number };

    constructor(props: P) {
        super(props);
        this.idRef = { current: 0 };
    }

    /**
     * Generates a unique identifier string.
     * Each call produces a different ID by combining timestamp and random number.
     */
    generateId = () => `item-${Date.now()}-${Math.random()}`;

    /**
     * Validates input value based on type and updates error state.
     *
     * @param name - The name of the input field to validate
     * @param value - The value to validate
     * @param type - The type of input for error messaging
     * @returns true if valid, false if invalid
     */
    validateInput = (name: string, value: string, type: string): boolean => {
        const state = this.state as { errors?: Record<string, string> };
        const newErrors = { ...(state.errors || {}) };

        if (!value.trim()) {
            newErrors[name] = `${type} name is required`;
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
            newErrors[name] = `${type} name must be a valid identifier`;
        } else {
            delete newErrors[name];
        }

        this.setState({ errors: newErrors } as unknown as S);
        return !newErrors[name];
    };

    /**
     * Handles Enter key press to trigger an action.
     * Prevents default form submission behavior.
     *
     * @param e - The keyboard event
     * @param action - The action to execute on Enter key
     */
    handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    /**
     * Abstract method to be implemented by subclasses.
     * Should render the component's UI.
     */
    abstract render(): React.ReactNode;
}
