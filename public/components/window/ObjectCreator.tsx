import React from "react";
import ParamInput from "@/public/components/window/param_input";
import MethodInput from "@/public/components/window/method_input";
import ConstructorInput from "@/public/components/window/constructor_input";
import Visibility from "@/public/components/visibility";

/**
 * Common state interface for UML object creators.
 */
export interface BaseObjectCreatorState {
    errors: Record<string, string>;
    params?: ParamInput[];
    methods?: MethodInput[];
    constructors?: ConstructorInput[];
    editingParam?: string | null;
    editingMethod?: string | null;
    paramDraft?: Omit<ParamInput, 'id'>;
    methodDraft?: Omit<MethodInput, 'id'>;
}

/**
 * Abstract base class for all UML object creator components.
 * Provides shared functionality for validation, ID generation, and event handling.
 */
export default abstract class ObjectCreator<P = object, S extends BaseObjectCreatorState = BaseObjectCreatorState> extends React.Component<P, S> {
    idRef: { current: number };

    constructor(props: P) {
        super(props);
        this.idRef = { current: 0 };
    }

    /**
     * Generates a unique identifier string.
     * Each call produces a different ID by combining timestamp and random number.
     */
    generateId() {
        return `item-${Date.now()}-${Math.random()}`;
    }

    /**
     * Validates input value based on type and updates error state.
     *
     * @param name - The name of the input field to validate
     * @param value - The value to validate
     * @param type - The type of input for error messaging
     * @returns true if valid, false if invalid
     */
    validateInput(name: string, value: string, type: string): boolean {
        const { errors } = this.state;
        const newErrors: Record<string, string> = { ...(errors || {}) };

        if (!value.trim()) {
            newErrors[name] = `${type} name is required`;
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
            newErrors[name] = `${type} name must be a valid identifier`;
        } else {
            delete newErrors[name];
        }

        this.setState({ errors: newErrors } as unknown as S);
        return !newErrors[name];
    }

    /**
     * Handles Enter key press to trigger an action.
     * Prevents default form submission behavior.
     *
     * @param e - The keyboard event
     * @param action - The action to execute on Enter key
     */
    handleKeyPress(e: React.KeyboardEvent, action: () => void) {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    }

    /**
     * Renders checkbox inputs for modifying properties of an item such as `isStatic` and `isFinal`.
     */
    renderModifierCheckboxes(
        item: { isStatic?: boolean; isFinal?: boolean; isAbstract?: boolean; isDefault?: boolean },
        onChange: (field: string, value: boolean) => void,
        type: 'param' | 'method'
    ) {
        return (
            <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        checked={item.isStatic || false}
                        onChange={(e) => onChange('isStatic', e.target.checked)}
                        className="h-3 w-3"
                    />
                    static
                </label>
                {type === 'param' && (
                    <label className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={item.isFinal || false}
                            onChange={(e) => onChange('isFinal', e.target.checked)}
                            className="h-3 w-3"
                        />
                        final
                    </label>
                )}
                {type === 'method' && (
                    <label className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={(item as { isAbstract?: boolean }).isAbstract || false}
                            onChange={(e) => onChange('isAbstract', e.target.checked)}
                            className="h-3 w-3"
                        />
                        abstract
                    </label>
                )}
                {type === 'method' && 'isDefault' in item && (
                    <label className="flex items-center gap-1">
                        <input
                            type="checkbox"
                            checked={(item as { isDefault?: boolean }).isDefault || false}
                            onChange={(e) => onChange('isDefault', e.target.checked)}
                            className="h-3 w-3"
                        />
                        default
                    </label>
                )}
            </div>
        );
    }

    // --- Shared CRUD Operations ---

    handleEditParam(id: string) {
        const { params } = this.state;
        if (!params) return;
        const param = params.find(p => p.id === id);
        if (param) {
            this.setState({
                paramDraft: {
                    name: param.name,
                    type: param.type,
                    visibility: param.visibility,
                    isStatic: param.isStatic || false,
                    isFinal: param.isFinal || false
                },
                editingParam: id
            } as unknown as S);
        }
    }

    handleCancelEditParam = () => {
        const { errors } = this.state;
        const newErrors = { ...errors };
        delete newErrors.paramName;
        delete newErrors.paramType;

        this.setState({
            paramDraft: {
                name: "",
                type: "",
                visibility: (this.state.paramDraft as { visibility?: Visibility } | undefined)?.visibility || Visibility.PRIVATE,
                isStatic: false,
                isFinal: false
            },
            editingParam: null,
            errors: newErrors
        } as unknown as S);
    };

    handleEditMethod(id: string) {
        const { methods } = this.state;
        if (!methods) return;
        const method = methods.find(m => m.id === id);
        if (method) {
            const { id: methodId, ...draft } = method;
            void methodId;
            this.setState({
                methodDraft: draft,
                editingMethod: id
            } as unknown as S);
        }
    }

    handleCancelEditMethod = () => {
        const { errors } = this.state;
        const newErrors = { ...errors };
        delete newErrors.methodName;
        delete newErrors.methodType;

        this.setState({
            methodDraft: {
                name: "",
                returnType: "",
                visibility: (this.state.methodDraft as { visibility?: Visibility } | undefined)?.visibility || Visibility.PUBLIC,
                isStatic: false
            },
            editingMethod: null,
            errors: newErrors
        } as unknown as S);
    };

    handleRemoveParam(id: string) {
        const { params, editingParam } = this.state;
        if (!params) return;

        this.setState({
            params: params.filter(p => p.id !== id)
        } as unknown as S, () => {
            if (editingParam === id) {
                this.handleCancelEditParam();
            }
        });
    }

    handleRemoveMethod(id: string) {
        const { methods, editingMethod } = this.state;
        if (!methods) return;

        this.setState({
            methods: methods.filter(m => m.id !== id)
        } as unknown as S, () => {
            if (editingMethod === id) {
                this.handleCancelEditMethod();
            }
        });
    }

    handleRemoveConstructor(id: string) {
        const { constructors } = this.state;
        if (!constructors) return;

        this.setState({
            constructors: constructors.filter(c => c.id !== id)
        } as unknown as S);
    }

    /**
     * Abstract method to be implemented by subclasses.
     * Should render the component's UI.
     */
    abstract render(): React.ReactNode;
}
