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

}
