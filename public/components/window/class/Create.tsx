import React from "react";
import {CreateClassProps, CreateClassState} from "@/public/components/window/class/properties";
import Visibility from "@/public/components/visibility";
import Class from "@/public/components/class/Class";

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

    /**
     * Handles the addition of a parameter draft to the list of parameters.
     *
     * This method performs the following:
     * - Validates the `name` and `type` fields of the `paramDraft` object using `validateInput`.
     * - Checks for duplicate parameter names in the existing `params` list.
     * - If the parameter is valid and not a duplicate, adds it to the `params` list, assigns it a unique `id`, and resets the `paramDraft` object to default values.
     * - Updates the error states by clearing validation errors for the `name` and `type` fields, or sets an error if the parameter name is a duplicate.
     *
     * Validation and duplicate checks:
     * - Name and type fields must meet validation criteria defined in `validateInput`.
     * - Duplicate parameter names are not allowed and flagged with an error.
     *
     * State changes:
     * - Updates the `params` array with the newly added parameter.
     * - Resets the `paramDraft` object to its initial, default state.
     * - Clears or updates the `errors` object as appropriate.
     */
    handleAddParam = () => {
        const { paramDraft, params } = this.state;
        const isNameValid = this.validateInput('paramName', paramDraft.name, 'param');
        const isTypeValid = this.validateInput('paramType', paramDraft.type, 'param');
        if (isNameValid && isTypeValid) {
            const isDuplicate = params.some(p => p.name === paramDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, paramName: 'Parameter name already exists' }
                }));
                return;
            }
            this.setState(prev => ({
                params: [
                    ...prev.params,
                    {
                        ...paramDraft,
                        id: this.generateId(),
                        name: paramDraft.name.trim(),
                        type: paramDraft.type.trim()
                    }
                ],
                paramDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PRIVATE,
                    isStatic: false,
                    isFinal: false
                },
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.paramName;
                    delete newErrors.paramType;
                    return newErrors;
                })()
            }));
        }
    };

    /**
     * Updates the component state to enable editing of a specific parameter based on its ID.
     *
     * This function searches for a parameter in the existing state using the provided ID.
     * If the parameter is found, it populates a draft object with the parameter's details
     * (name, type, visibility, isStatic, isFinal) and sets up the editing context. The draft
     * is used to pre-fill the editing form and the editing context tracks the parameter being edited.
     *
     * @param {string} id - Identifier of the parameter to be edited.
     */
    handleEditParam = (id: string) => {
        const param = this.state.params.find(p => p.id === id);
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
            });
        }
    };

    /**
     * Handles the update operation for a parameter being edited.
     *
     * This function validates the updated parameter's name and type, ensuring that the input data meets the necessary requirements.
     * If the validation passes and no duplicate parameter name exists, the function updates the specified parameter
     * in the parameter list while clearing any associated errors. If a duplicate name is detected, it sets an error
     * message to notify the user.
     *
     * State Changes:
     * - Updates `params` to reflect the changes to the edited parameter.
     * - Resets `paramDraft` to its default state.
     * - Clears the `editingParam` property.
     * - Removes relevant error messages from the `errors` object.
     * - Sets an error message in `errors` if a duplicate parameter name is found.
     *
     * Assumptions:
     * - `validateInput` is a method that checks the validity of a given field against specific criteria.
     * - `params` contains a list of parameter objects that each have `id`, `name`, and `type` properties, among others.
     *
     * Preconditions:
     * - `paramDraft` represents the current edits to a parameter and contains fields such as `name`, `type`, `visibility`, `isStatic`, and `isFinal`.
     * - `editingParam` is a non-null value representing the ID of the parameter being edited.
     * - The `state` object contains `params`, `paramDraft`, `editingParam`, and `errors`.
     *
     * Postconditions:
     * - If validation and uniqueness checks pass, the parameter with the corresponding `editingParam` ID is updated in the `params` array.
     * - Any fields in the `paramDraft` that are invalid will block the update and retain their associated error states.
     *
     * Error Handling:
     * - If the parameter's name already exists in the `params` list (excluding the parameter being edited), an error message is set
     *   in the `errors` object under the key `paramName`.
     *
     * Fields Used:
     * - `this.state.params`: The list of existing parameters.
     * - `this.state.paramDraft`: Stores the changes being made to the parameter.
     * - `this.state.editingParam`: Identifies which parameter is being edited.
     * - `this.state.errors`: Stores any validation or related errors.
     */
    handleUpdateParam = () => {
        const { paramDraft, params, editingParam } = this.state;
        if (!editingParam) return;
        const isNameValid = this.validateInput('paramName', paramDraft.name, 'param');
        const isTypeValid = this.validateInput('paramType', paramDraft.type, 'param');
        if (isNameValid && isTypeValid) {
            const isDuplicate = params.some(p => p.name === paramDraft.name.trim() && p.id !== editingParam);
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, paramName: 'Parameter name already exists' }
                }));
                return;
            }
            this.setState(prev => ({
                params: prev.params.map(p =>
                    p.id === editingParam
                        ? {
                            ...paramDraft,
                            id: p.id,
                            name: paramDraft.name.trim(),
                            type: paramDraft.type.trim()
                        }
                        : p
                ),
                paramDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PRIVATE,
                    isStatic: false,
                    isFinal: false
                },
                editingParam: null,
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.paramName;
                    delete newErrors.paramType;
                    return newErrors;
                })()
            }));
        }
    };

    /**
     * Resets the parameter editing state to its default values.
     *
     * The `handleCancelEditParam` function is used to clear the current parameter being edited,
     * reset the parameter draft fields to default values (empty or initial state),
     * and remove any associated validation errors specific to the parameter being edited.
     *
     * State Updates:
     * - Clears the `paramDraft` object by resetting its `name`, `type`, `visibility`, `isStatic`, and `isFinal` properties.
     * - Sets `editingParam` to `null` indicating no parameter is currently being edited.
     * - Removes validation errors related to `paramName` and `paramType` from the `errors` object.
     */
    handleCancelEditParam = () => {
        this.setState(prev => ({
            paramDraft: {
                name: "",
                type: "",
                visibility: Visibility.PRIVATE,
                isStatic: false,
                isFinal: false
            },
            editingParam: null,
            errors: (() => {
                const newErrors = { ...prev.errors };
                delete newErrors.paramName;
                delete newErrors.paramType;
                return newErrors;
            })()
        }));
    };

    /**
     * Handles the addition of a new method to the application's state.
     *
     * This function performs the following operations:
     * - Validates the input values for the method's name and return type.
     * - Checks for duplication of the method name within the existing list of methods.
     * - Updates the state to include the new method if validation succeeds and no duplication is found.
     * - Resets the `methodDraft` object to its default state after a successful addition.
     * - Clears any validation errors related to the method's name and return type if the addition is successful.
     * - Displays an appropriate error message if the method name is a duplicate.
     *
     * Preconditions:
     * - The `this.state` object must include the `methodDraft`, `methods`, and `errors` properties.
     * - The `methodDraft` object should contain `name`, `returnType`, `visibility`, and `isStatic` properties.
     * - The `methods` array should consist of objects representing existing methods, each having at least a `name` property.
     * - The `validateInput` method must be implemented for validating specific input fields.
     * - The `generateId` method must be implemented for creating unique IDs for new methods.
     *
     * Postconditions:
     * - If the input is valid and the method name is unique, the new method is added to the `methods` array in the state.
     * - If a duplicate name is detected, the `errors.methodName` property is updated to indicate the duplication issue.
     *
     * Side Effects:
     * - Modifies the `this.state.methods`, `this.state.methodDraft`, and `this.state.errors` properties.
     */
    handleAddMethod = () => {
        const { methodDraft, methods } = this.state;
        const isNameValid = this.validateInput('methodName', methodDraft.name, 'method');
        const isTypeValid = this.validateInput('methodType', methodDraft.returnType, 'method');
        if (isNameValid && isTypeValid) {
            const isDuplicate = methods.some(m => m.name === methodDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, methodName: 'Method name already exists' }
                }));
                return;
            }
            this.setState(prev => ({
                methods: [
                    ...prev.methods,
                    {
                        ...methodDraft,
                        id: this.generateId(),
                        name: methodDraft.name.trim(),
                        returnType: methodDraft.returnType.trim()
                    }
                ],
                methodDraft: {
                    name: "",
                    returnType: "",
                    visibility: Visibility.PUBLIC,
                    isStatic: false
                },
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.methodName;
                    delete newErrors.methodType;
                    return newErrors;
                })()
            }));
        }
    };

    /**
     * Handles the editing process of a method by its identifier.
     *
     * This function searches for a method in the current component's state using the
     * provided `id`. If a method with the corresponding identifier is found, it updates
     * the state to set up the editing environment, including a draft of the method's
     * properties and marking the method as being edited.
     *
     * @param {string} id - The unique identifier of the method to be edited.
     */
    handleEditMethod = (id: string) => {
        const method = this.state.methods.find(m => m.id === id);
        if (method) {
            this.setState({
                methodDraft: {
                    name: method.name,
                    returnType: method.returnType,
                    visibility: method.visibility,
                    isStatic: method.isStatic || false
                },
                editingMethod: id
            });
        }
    };

    /**
     * Handles the process of updating an existing method in the state based on the current `methodDraft`.
     * The method validates the draft's name and return type, checks for duplicates, and updates the list of methods if valid.
     *
     * Performs the following steps:
     * 1. Validates the name (`methodDraft.name`) and the return type (`methodDraft.returnType`) of the method draft using `validateInput`.
     * 2. Checks if a method with the same name already exists in the list of methods, excluding the currently edited method.
     * 3. If validation succeeds and no duplicate exists, updates the method in the `methods` array within the state.
     * 4. Resets the `methodDraft` to a default empty state and clears any associated validation errors.
     * 5. Sets `editingMethod` to null after a successful update.
     * 6. If a duplicate name is detected, adds an error message to the state for the method name.
     *
     * State modifications:
     * - If successful:
     *   - Updates the `methods` array with the modified method.
     *   - Resets `methodDraft` to a default state.
     *   - Clears errors for method name and return type.
     *   - Sets `editingMethod` to null.
     * - If a duplicate name is detected:
     *   - Updates the `errors` object in the state with a relevant error message for `methodName`.
     *
     * Precondition:
     * - `this.state` contains `methodDraft` (draft of the method being edited), `methods` (list of existing methods),
     *   `editingMethod` (ID of the method being edited), and `errors` (validation errors, if any).
     *
     * Postcondition:
     * - If validation fails or a duplicate is detected, no changes are made to the `methods` array, and error messages are updated.
     * - If validation succeeds and no duplicate is detected, the existing method is updated with the values from `methodDraft`.
     */
    handleUpdateMethod = () => {
        const { methodDraft, methods, editingMethod } = this.state;
        if (!editingMethod) return;
        const isNameValid = this.validateInput('methodName', methodDraft.name, 'method');
        const isTypeValid = this.validateInput('methodType', methodDraft.returnType, 'method');
        if (isNameValid && isTypeValid) {
            const isDuplicate = methods.some(m => m.name === methodDraft.name.trim() && m.id !== editingMethod);
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, methodName: 'Method name already exists' }
                }));
                return;
            }
            this.setState(prev => ({
                methods: prev.methods.map(m =>
                    m.id === editingMethod
                        ? {
                            ...methodDraft,
                            id: m.id,
                            name: methodDraft.name.trim(),
                            returnType: methodDraft.returnType.trim()
                        }
                        : m
                ),
                methodDraft: {
                    name: "",
                    returnType: "",
                    visibility: Visibility.PUBLIC,
                    isStatic: false
                },
                editingMethod: null,
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.methodName;
                    delete newErrors.methodType;
                    return newErrors;
                })()
            }));
        }
    };

    /**
     * Resets the editing state for a method in a form or editor.
     *
     * This function clears the current method draft data, including the
     * name, return type, visibility, and static property, by resetting
     * them to default values. Additionally, it removes any validation
     * errors related to the method's name and type from the errors object.
     *
     * Updates applied:
     * - Resets the `methodDraft` object to default values.
     * - Clears the `editingMethod` reference to indicate no active method is being edited.
     * - Removes `methodName` and `methodType` keys from the validation `errors` object.
     */
    handleCancelEditMethod = () => {
        this.setState(prev => ({
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            },
            editingMethod: null,
            errors: (() => {
                const newErrors = { ...prev.errors };
                delete newErrors.methodName;
                delete newErrors.methodType;
                return newErrors;
            })()
        }));
    };

    /**
     * Handles the addition of a new constructor to the state.
     *
     * This function checks if there are parameters available to create a constructor.
     * If no parameters are provided, it sets an error message in the state.
     *
     * It ensures that no duplicate constructors are created by comparing parameter types.
     * If a constructor with the same parameters already exists, it sets a duplicate error message in the state.
     *
     * If the constructor is valid and non-duplicate, it clears any existing errors related
     * to constructors and adds the new constructor to the list of constructors in the state.
     *
     * The new constructor is assigned an auto-generated unique ID and a name.
     * If the class name is empty or only contains whitespace, the default name "Constructor" is used.
     *
     * Note: This function directly updates the component's state by calling `this.setState`.
     */
    handleAddConstructor = () => {
        const { params, constructors, className } = this.state;

        if (params.length === 0) {
            this.setState(prev => ({
                errors: {
                    ...prev.errors,
                    constructor: 'Add parameters first to create a constructor'
                }
            }));
            return;
        }

        const constructorName = className.trim() || 'Constructor';

        // Check for duplicate constructor by comparing parameter types
        const isDuplicate = constructors.some(c =>
            c.params.length === params.length &&
            c.params.every((p, i) => p.type === params[i]?.type)
        );

        if (isDuplicate) {
            this.setState(prev => ({
                errors: {
                    ...prev.errors,
                    constructor: 'Constructor with same parameters already exists'
                }
            }));
            return;
        }

        // Clear any existing constructor error and add the new constructor
        this.setState(prev => ({
            constructors: [
                ...prev.constructors,
                {
                    id: this.generateId(),
                    name: constructorName,
                    params: [...params] // Create a copy of params
                }
            ],
            errors: (() => {
                const newErrors = { ...prev.errors };
                delete (newErrors as any).constructor; // Clear constructor error on success
                return newErrors;
            })()
        }));
    };

    /**
     * Removes a parameter with the specified ID from the component state.
     * Updates the `params` array by filtering out the parameter that matches the given ID.
     * If the removed parameter is currently being edited, the editing action is canceled.
     *
     * @param {string} id - The unique identifier of the parameter to be removed.
     */
    handleRemoveParam = (id: string) => {
        this.setState(prev => ({
            params: prev.params.filter(p => p.id !== id)
        }), () => {
            if (this.state.editingParam === id) {
                this.handleCancelEditParam();
            }
        });
    };

    /**
     * Handles the removal of a method by its unique identifier.
     *
     * This function updates the component's state by filtering out the method
     * with the specified `id` from the `methods` array. Upon successfully
     * updating the state, it checks if the currently editing method matches
     * the removed method's `id`. If so, it triggers the cancellation of the
     * editing state.
     *
     * @param {string} id - The unique identifier of the method to be removed.
     */
    handleRemoveMethod = (id: string) => {
        this.setState(prev => ({
            methods: prev.methods.filter(m => m.id !== id)
        }), () => {
            if (this.state.editingMethod === id) {
                this.handleCancelEditMethod();
            }
        });
    };

    /**
     * Handles the removal of a constructor by its unique identifier.
     *
     * This function updates the state by filtering out a constructor object
     * from the `constructors` array in the component's state that matches
     * the given `id`.
     *
     * @param {string} id - The unique identifier of the constructor to be removed.
     */
    handleRemoveConstructor = (id: string) => {
        this.setState(prev => ({
            constructors: prev.constructors.filter(c => c.id !== id)
        }));
    };

    /**
     * Handles the addition of a new class element to the application's state and triggers relevant updates.
     *
     * Validates the provided class name to ensure it meets the required format. If the validation fails,
     * the process is terminated. When the class name is valid, the function constructs a new class instance
     * with initialized properties, assigns a unique identifier, and invokes the provided `onAdd` callback
     * to add the new class element to the parent component or state.
     *
     * After successfully adding the class, it resets the state properties related to the class creation form,
     * such as clearing input fields, resetting drafts, and preparing default states for further inputs.
     *
     * Finally, if a callback for closing the modal/dialog (`onClose`) is provided, it will be invoked to
     * finalize the process.
     *
     * State properties:
     * - `className` (string): The name of the class being created, cleared after addition.
     * - `params` (array): The list of parameters for the class, reset to an empty array.
     * - `methods` (array): The list of methods for the class, reset to an empty array.
     * - `constructors` (array): Constructors for the class, reset to an empty array.
     * - `autoGettersSetters` (boolean): Flag for generating getters and setters automatically, reset to `false`.
     * - `errors` (object): Holds validation error details, reset to an empty object.
     * - `editingParam` (object | null): Parameter currently being edited, reset to `null`.
     * - `editingMethod` (object | null): Method currently being edited, reset to `null`.
     * - `paramDraft` (object): Draft object for creating or editing a parameter, reset to default values.
     * - `methodDraft` (object): Draft object for creating or editing a method, reset to default values.
     *
     * Dependencies:
     * - `validateInput`: Validates the class name input.
     * - `Class`: React component representing a class diagram element.
     *
     * Props:
     * - `onAdd` (function): Callback to handle the addition of the new class element.
     * - `onClose` (function | undefined): Callback to close the dialog/modal.
     * - `onDelete` (function): Callback to handle deletion of class elements.
     * - `onInspect` (function): Callback for inspecting class properties.
     * - `onExport` (function): Callback for exporting class data.
     */
    handleAddClass = () => {
        const { className, params, methods, constructors, autoGettersSetters } = this.state;
        const { onAdd, onClose, onDelete, onInspect, onExport } = this.props;
        const isClassNameValid = this.validateInput('className', className, 'class');
        if (!isClassNameValid) return;
        const finalClassName = className.trim() || `Class${this.idRef.current}`;
        const id = `class-${this.idRef.current++}`;
        const newClass = (
            <Class
                key={id}
                name={finalClassName}
                x={100}
                y={100}
                draggable={true}
                params={params}
                methods={methods}
                constructors={constructors}
                autoGettersSetters={autoGettersSetters}
                onDelete={onDelete}
                onInspect={onInspect}
                onExport={onExport}
            />
        );
        onAdd(newClass);
        this.setState({
            className: "",
            params: [],
            methods: [],
            constructors: [],
            errors: {},
            autoGettersSetters: false,
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
            }
        });
        onClose?.();
    };

    /**
     * Handles the 'Enter' key press event for a given React keyboard event.
     * If the 'Enter' key is pressed, the default browser action is prevented
     * and the specified callback action is executed.
     *
     * @param {React.KeyboardEvent} e - The keyboard event triggered by user interaction.
     * @param {Function} action - A callback function to be executed when the 'Enter' key is pressed.
     */
    handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            action();
        }
    };

    /**
     * Renders checkbox inputs for modifying properties of an item such as `isStatic` and `isFinal`.
     * The checkboxes allow toggling these properties, and the changes are passed back via the `onChange` callback.
     *
     * @param {Object} item - An object representing the item with optional `isStatic` and `isFinal` properties.
     * @param {boolean} [item.isStatic] - Indicates if the item is static.
     * @param {boolean} [item.isFinal] - Indicates if the item is final.
     * @param {Function} onChange - Callback function triggered when a checkbox value changes.
     *                              Receives two arguments: the field name ('isStatic' or 'isFinal') and the new boolean value of the field.
     * @param {'param'|'method'} type - Specifies the type of item. If set to 'param', the `isFinal` checkbox will be rendered.
     *
     * @return {JSX.Element} A JSX element containing the checkbox inputs for modifying the item's properties.
     */
    renderModifierCheckboxes(
        item: { isStatic?: boolean; isFinal?: boolean },
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
            </div>
        );
    }

    render() {
        const {
            className, params, constructors, methods, errors,
            editingParam, editingMethod, paramDraft, methodDraft, autoGettersSetters
        } = this.state;
        const { onClose, onDelete, onInspect, onExport } = this.props;
        const isFormValid = className.trim() && Object.keys(errors).length === 0;

        return (
            <div className="absolute top-4 left-4 p-6 bg-white rounded-lg shadow-lg w-[36rem] space-y-6 overflow-y-auto max-h-[90vh] z-10 border" style={{overflowY: "auto"}}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Class</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Class Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Class Name *</label>
                    <input
                        type="text"
                        placeholder="Enter class name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.className ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={className}
                        onChange={(e) => {
                            this.setState({ className: e.target.value });
                            if (errors.className) {
                                this.validateInput('className', e.target.value, 'class');
                            }
                        }}
                        onBlur={() => this.validateInput('className', className, 'class')}
                        onKeyPress={(e) => this.handleKeyPress(e, this.handleAddClass)}
                    />
                    {errors.className && (
                        <p className="text-xs text-red-500">{errors.className}</p>
                    )}
                </div>

                {/* Parameters Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Parameters</h3>

                    {/* Add/Edit Parameter Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Name"
                                value={paramDraft.name}
                                onChange={(e) => this.setState({ paramDraft: { ...paramDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingParam ? this.handleUpdateParam : this.handleAddParam)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.paramName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={paramDraft.type}
                                onChange={(e) => this.setState({ paramDraft: { ...paramDraft, type: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingParam ? this.handleUpdateParam : this.handleAddParam)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.paramType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={paramDraft.visibility}
                                onChange={(e) => this.setState({ paramDraft: { ...paramDraft, visibility: e.target.value as Visibility } })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={Visibility.PRIVATE}>private</option>
                                <option value={Visibility.PUBLIC}>public</option>
                                <option value={Visibility.PROTECTED}>protected</option>
                            </select>
                        </div>

                        {/* Parameter Modifiers */}
                        {this.renderModifierCheckboxes(
                            paramDraft,
                            (field, value) => this.setState({ paramDraft: { ...paramDraft, [field]: value } }),
                            'param'
                        )}

                        {(errors.paramName || errors.paramType) && (
                            <p className="text-xs text-red-500">
                                {errors.paramName || errors.paramType}
                            </p>
                        )}

                        <div className="flex gap-2">
                            {editingParam ? (
                                <>
                                    <button
                                        onClick={this.handleUpdateParam}
                                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                    >
                                        ✓ Update Parameter
                                    </button>
                                    <button
                                        onClick={this.handleCancelEditParam}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
                                    >
                                        ✗ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={this.handleAddParam}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    + Add Parameter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Parameter List */}
                    {params.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {params.map((param) => (
                                <div key={param.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                                    editingParam === param.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}>
                                    <span className="flex-1">
                                        <span className="text-gray-500">{param.visibility}</span>
                                        {param.isStatic && <span className="text-blue-600 ml-1">static</span>}
                                        {param.isFinal && <span className="text-purple-600 ml-1">final</span>}
                                        <span className="ml-1">{param.name}: {param.type}</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditParam(param.id)}
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                            aria-label="Edit parameter"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => this.handleRemoveParam(param.id)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Remove parameter"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Methods Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Methods</h3>

                    {/* Add/Edit Method Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Name"
                                value={methodDraft.name}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.methodName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Return Type"
                                value={methodDraft.returnType}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, returnType: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                    errors.methodType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={methodDraft.visibility}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, visibility: e.target.value as Visibility } })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={Visibility.PRIVATE}>private</option>
                                <option value={Visibility.PUBLIC}>public</option>
                                <option value={Visibility.PROTECTED}>protected</option>
                            </select>
                        </div>

                        {/* Method Modifiers */}
                        {this.renderModifierCheckboxes(
                            methodDraft,
                            (field, value) => this.setState({ methodDraft: { ...methodDraft, [field]: value } }),
                            'method'
                        )}

                        {(errors.methodName || errors.methodType) && (
                            <p className="text-xs text-red-500">
                                {errors.methodName || errors.methodType}
                            </p>
                        )}

                        <div className="flex gap-2">
                            {editingMethod ? (
                                <>
                                    <button
                                        onClick={this.handleUpdateMethod}
                                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                    >
                                        ✓ Update Method
                                    </button>
                                    <button
                                        onClick={this.handleCancelEditMethod}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
                                    >
                                        ✗ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={this.handleAddMethod}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    + Add Method
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Method List */}
                    {methods.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {methods.map((method) => (
                                <div key={method.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                                    editingMethod === method.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                }`}>
                                    <span className="flex-1">
                                        <span className="text-gray-500">{method.visibility}</span>
                                        {method.isStatic && <span className="text-blue-600 ml-1">static</span>}
                                        <span className="ml-1">{method.name}(): {method.returnType}</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditMethod(method.id)}
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                            aria-label="Edit method"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => this.handleRemoveMethod(method.id)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Remove method"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Constructors Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Constructors</h3>

                    <div className="space-y-2">
                        <button
                            onClick={this.handleAddConstructor}
                            className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                            disabled={params.length === 0}
                        >
                            + Use current parameters as constructor
                        </button>

                        {errors.constructor && (
                            <p className="text-xs text-red-500">{String(errors.constructor)}</p>
                        )}
                    </div>

                    {/* Constructor List */}
                    {constructors.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {constructors.map((constructor) => (
                                <div key={constructor.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                                    <span>
                                        {constructor.name}({constructor.params.map(p => `${p.name}: ${p.type}`).join(', ')})
                                    </span>
                                    <button
                                        onClick={() => this.handleRemoveConstructor(constructor.id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        aria-label="Remove constructor"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Auto-Generate Getters/Setters */}
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="autoGettersSetters"
                            checked={autoGettersSetters}
                            onChange={(e) => this.setState({ autoGettersSetters: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="autoGettersSetters" className="text-sm font-medium text-gray-700">
                            Auto-generate getters and setters
                        </label>
                    </div>
                    {autoGettersSetters && (
                        <div className="text-xs text-gray-500 ml-6">
                            Getters and setters will be automatically generated for all parameters
                        </div>
                    )}
                </div>

                {/* Preview */}
                {className && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="bg-white rounded border" style={{ minHeight: '150px' }}>
                            <svg width="100%" height="200" viewBox="0 0 280 200">
                                <Class
                                    key={`preview-${params.length}-${methods.length}-${constructors.length}-${className}-${autoGettersSetters}`}
                                    x={10}
                                    y={10}
                                    name={className}
                                    draggable={false}
                                    params={params}
                                    constructors={constructors}
                                    methods={methods}
                                    autoGettersSetters={autoGettersSetters}
                                    onDelete={onDelete}
                                    onInspect={onInspect}
                                    onExport={onExport}
                                />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={this.handleAddClass}
                    disabled={!isFormValid}
                    className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
                        isFormValid
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Create Class
                </button>
            </div>
        );
    }
}
