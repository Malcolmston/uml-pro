import React from "react";
import {CreateClassProps, CreateClassState} from "@/public/components/window/class/properties";
import Visibility from "@/public/components/visibility";

export default class CreateClass extends React.Component<CreateClassProps, CreateClassState> {
    idRef: { current: number };


    constructor(props: CreateClassProps) {
        super(props);
        this.idRef = { current: 0 };
        this.state = {
            className: "",
            params: [],
            constructors: [],
            methods: [],
            errors: {},
            editingParam: null,
            editingMethod: null,
            paramDraft: {
                name: "",
                type: "",
                visibility: Visibility.PRIVATE,
                isStatic: false,
                isFinal: false
            },
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            },
            autoGettersSetters: false
        };
    }

    /**
     * Lifecycle method invoked immediately after updating occurs.
     * It checks if the `initialData` prop has changed after the component has mounted,
     * and updates the state accordingly to populate relevant data fields.
     *
     * @param {CreateClassProps} prevProps The previous properties received by the component before the update.
     * @return {void} Does not return a value.
     */
    componentDidUpdate(prevProps: CreateClassProps) {
        // Autopopulate if initialData changes after mount
        if (
            this.props.initialData && this.props.initialData !== prevProps.initialData
        ) {
            const { initialData } = this.props;
            if (initialData.className) this.setState({ className: initialData.className });
            if (initialData.params) this.setState({ params: initialData.params });
            if (initialData.methods) this.setState({ methods: initialData.methods });
            if (initialData.constructors) this.setState({ constructors: initialData.constructors });
            if (typeof initialData.autoGettersSetters === 'boolean') this.setState({ autoGettersSetters: initialData.autoGettersSetters });
        }
    }

    /**
     * Generates a unique identifier string.
     *
     * This function creates a unique ID by combining a static prefix (`item-`),
     * the current timestamp in milliseconds, and a random number.
     * Each call to this function produces a different ID value.
     *
     * @returns {string} A unique identifier string.
     */
    generateId = () => `item-${Date.now()}-${Math.random()}`;

    /**
     * Validates the provided input value based on its type and updates the error state accordingly.
     *
     * @param {string} name - The name of the input field to validate.
     * @param {string} value - The value of the input field to validate.
     * @param {'class' | 'param' | 'method'} type - The type of the input, used for error messaging (e.g., 'class', 'param', or 'method').
     * @returns {boolean} - Returns `true` if the input is valid, otherwise `false`.
     */
    validateInput = (name: string, value: string, type: 'class' | 'param' | 'method') => {
        const newErrors = { ...this.state.errors };
        if (!value.trim()) {
            newErrors[name] = `${type} name is required`;
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
            newErrors[name] = `${type} name must be a valid identifier`;
        } else {
            delete newErrors[name];
        }
        this.setState({ errors: newErrors });
        return !newErrors[name];
    };
}
