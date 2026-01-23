import React from "react";
import { CreateEnumProps, CreateEnumState } from "./properties";
import Visibility from "@/public/components/visibility";
import Enumeration from "@/public/components/enum/Enum";
import ObjectCreator from "@/public/components/window/ObjectCreator";

export default class CreateEnum extends ObjectCreator<CreateEnumProps, CreateEnumState> {
    constructor(props: CreateEnumProps) {
        super(props);
        this.state = {
            enumName: "",
            enumConstants: [],
            params: [],
            constructors: [],
            methods: [],
            errors: {},
            editingConstant: null,
            editingParam: null,
            editingMethod: null,
            constantDraft: { name: "", values: [] },
            constantValues: "",
            paramDraft: {
                name: "",
                type: "",
                visibility: Visibility.PRIVATE,
                isFinal: true,
                isStatic: false
            },
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            }
        };
    }

    componentDidMount() {
        const { initialData } = this.props;
        if (initialData) {
            if (initialData.className) this.setState({ enumName: initialData.className });
            if (initialData.constants) {
                this.setState({
                    enumConstants: initialData.constants.map(c => ({
                        ...c,
                        id: `constant-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.params) {
                this.setState({
                    params: initialData.params.map(p => ({
                        ...p,
                        id: `param-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.methods) {
                this.setState({
                    methods: initialData.methods.map(m => ({
                        ...m,
                        id: `method-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.constructors) {
                this.setState({
                    constructors: initialData.constructors.map(c => ({
                        ...c,
                        id: `constructor-${Date.now()}-${Math.random()}`
                    }))
                });
            }
        }
    }

    componentDidUpdate(prevProps: CreateEnumProps) {
        // Auto-populate if initialData changes after mount
        if (
            this.props.initialData &&
            this.props.initialData !== prevProps.initialData
        ) {
            const { initialData } = this.props;
            if (initialData.className) this.setState({ enumName: initialData.className });
            if (initialData.constants) {
                this.setState({
                    enumConstants: initialData.constants.map(c => ({
                        ...c,
                        id: `constant-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.params) {
                this.setState({
                    params: initialData.params.map(p => ({
                        ...p,
                        id: `param-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.methods) {
                this.setState({
                    methods: initialData.methods.map(m => ({
                        ...m,
                        id: `method-${Date.now()}-${Math.random()}`
                    }))
                });
            }
            if (initialData.constructors) {
                this.setState({
                    constructors: initialData.constructors.map(c => ({
                        ...c,
                        id: `constructor-${Date.now()}-${Math.random()}`
                    }))
                });
            }
        }
    }

    // Quick template methods for common enum patterns
    applyCommonPatterns = (pattern: string) => {
        switch (pattern) {
            case 'status':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'ACTIVE' },
                        { id: this.generateId(), name: 'INACTIVE' },
                        { id: this.generateId(), name: 'PENDING' },
                        { id: this.generateId(), name: 'SUSPENDED' }
                    ]
                });
                break;

            case 'priority':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'LOW', values: ['1'] },
                        { id: this.generateId(), name: 'MEDIUM', values: ['2'] },
                        { id: this.generateId(), name: 'HIGH', values: ['3'] },
                        { id: this.generateId(), name: 'CRITICAL', values: ['4'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'level', type: 'int', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getLevel', returnType: 'int', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'color':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'RED', values: ['255', '0', '0'] },
                        { id: this.generateId(), name: 'GREEN', values: ['0', '255', '0'] },
                        { id: this.generateId(), name: 'BLUE', values: ['0', '0', '255'] },
                        { id: this.generateId(), name: 'WHITE', values: ['255', '255', '255'] },
                        { id: this.generateId(), name: 'BLACK', values: ['0', '0', '0'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'red', type: 'int', visibility: Visibility.PRIVATE, isFinal: true },
                        { id: this.generateId(), name: 'green', type: 'int', visibility: Visibility.PRIVATE, isFinal: true },
                        { id: this.generateId(), name: 'blue', type: 'int', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getRed', returnType: 'int', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'getGreen', returnType: 'int', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'getBlue', returnType: 'int', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'toHex', returnType: 'String', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'day':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'MONDAY', values: ['1'] },
                        { id: this.generateId(), name: 'TUESDAY', values: ['2'] },
                        { id: this.generateId(), name: 'WEDNESDAY', values: ['3'] },
                        { id: this.generateId(), name: 'THURSDAY', values: ['4'] },
                        { id: this.generateId(), name: 'FRIDAY', values: ['5'] },
                        { id: this.generateId(), name: 'SATURDAY', values: ['6'] },
                        { id: this.generateId(), name: 'SUNDAY', values: ['7'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'dayNumber', type: 'int', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getDayNumber', returnType: 'int', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isWeekend', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'size':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'SMALL', values: ['"S"'] },
                        { id: this.generateId(), name: 'MEDIUM', values: ['"M"'] },
                        { id: this.generateId(), name: 'LARGE', values: ['"L"'] },
                        { id: this.generateId(), name: 'EXTRA_LARGE', values: ['"XL"'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'code', type: 'String', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getCode', returnType: 'String', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'operation':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'ADD', values: ['"+"'] },
                        { id: this.generateId(), name: 'SUBTRACT', values: ['"-"'] },
                        { id: this.generateId(), name: 'MULTIPLY', values: ['"*"'] },
                        { id: this.generateId(), name: 'DIVIDE', values: ['"/"'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'symbol', type: 'String', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getSymbol', returnType: 'String', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'calculate', returnType: 'double', visibility: Visibility.PUBLIC, isStatic: false }
                    ]
                });
                break;

            case 'http-status':
                this.setState({
                    enumConstants: [
                        { id: this.generateId(), name: 'OK', values: ['200', '"OK"'] },
                        { id: this.generateId(), name: 'NOT_FOUND', values: ['404', '"Not Found"'] },
                        { id: this.generateId(), name: 'INTERNAL_SERVER_ERROR', values: ['500', '"Internal Server Error"'] },
                        { id: this.generateId(), name: 'BAD_REQUEST', values: ['400', '"Bad Request"'] }
                    ],
                    params: [
                        { id: this.generateId(), name: 'code', type: 'int', visibility: Visibility.PRIVATE, isFinal: true },
                        { id: this.generateId(), name: 'message', type: 'String', visibility: Visibility.PRIVATE, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getCode', returnType: 'int', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'getMessage', returnType: 'String', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isError', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;
        }
    };

    suggestConstantsFromName = () => {
        const { enumName } = this.state;
        const name = enumName.toLowerCase();
        const suggestions: string[] = [];

        if (name.includes('status') || name.includes('state')) {
            suggestions.push('ACTIVE', 'INACTIVE', 'PENDING');
        }
        if (name.includes('priority') || name.includes('level')) {
            suggestions.push('LOW', 'MEDIUM', 'HIGH');
        }
        if (name.includes('color')) {
            suggestions.push('RED', 'GREEN', 'BLUE');
        }
        if (name.includes('size')) {
            suggestions.push('SMALL', 'MEDIUM', 'LARGE');
        }
        if (name.includes('day')) {
            suggestions.push('MONDAY', 'TUESDAY', 'WEDNESDAY');
        }
        if (name.includes('month')) {
            suggestions.push('JANUARY', 'FEBRUARY', 'MARCH');
        }
        if (name.includes('direction')) {
            suggestions.push('NORTH', 'SOUTH', 'EAST', 'WEST');
        }
        if (name.includes('role') || name.includes('permission')) {
            suggestions.push('ADMIN', 'USER', 'GUEST');
        }

        return suggestions;
    };

    // Override validateInput to add enum-specific validation
    validateInput = (name: string, value: string, type: string) => {
        const newErrors = { ...this.state.errors };

        if (!value.trim()) {
            newErrors[name] = `${type} name is required`;
        } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim())) {
            newErrors[name] = `${type} name must be a valid identifier`;
        } else if (type === 'constant' && !/^[A-Z][A-Z0-9_]*$/.test(value.trim())) {
            newErrors[name] = `Enum constant should be in UPPER_CASE`;
        } else {
            delete newErrors[name];
        }

        this.setState({ errors: newErrors } as Partial<CreateEnumState>);
        return !newErrors[name];
    };

    handleAddConstant = () => {
        const { constantDraft, constantValues, enumConstants } = this.state;
        const isNameValid = this.validateInput('constantName', constantDraft.name, 'constant');

        if (isNameValid) {
            const isDuplicate = enumConstants.some(c => c.name === constantDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, constantName: 'Constant name already exists' } }));
                return;
            }

            this.setState(prev => ({
                enumConstants: [...prev.enumConstants, {
                    ...constantDraft,
                    id: this.generateId(),
                    name: constantDraft.name.trim(),
                    values: constantValues.trim() ? constantValues.split(',').map(v => v.trim()) : []
                }],
                constantDraft: { name: "", values: [] },
                constantValues: "",
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.constantName;
                    return newErrors;
                })()
            }));
        }
    };

    handleQuickAddConstant = (name: string, values?: string[]) => {
        const { enumConstants } = this.state;
        const isDuplicate = enumConstants.some(c => c.name === name);

        if (!isDuplicate) {
            this.setState(prev => ({
                enumConstants: [...prev.enumConstants, {
                    id: this.generateId(),
                    name: name,
                    values: values
                }]
            }));
        }
    };

    handleEditConstant = (id: string) => {
        const { enumConstants } = this.state;
        const constant = enumConstants.find(c => c.id === id);
        if (constant) {
            this.setState({
                constantDraft: {
                    name: constant.name,
                    values: constant.values || []
                },
                constantValues: constant.values ? constant.values.join(', ') : '',
                editingConstant: id
            });
        }
    };

    handleUpdateConstant = () => {
        const { constantDraft, constantValues, enumConstants, editingConstant } = this.state;
        if (!editingConstant) return;

        const isNameValid = this.validateInput('constantName', constantDraft.name, 'constant');

        if (isNameValid) {
            const isDuplicate = enumConstants.some(c => c.name === constantDraft.name.trim() && c.id !== editingConstant);
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, constantName: 'Constant name already exists' } }));
                return;
            }

            this.setState(prev => ({
                enumConstants: prev.enumConstants.map(c =>
                    c.id === editingConstant
                        ? {
                            ...constantDraft,
                            id: c.id,
                            name: constantDraft.name.trim(),
                            values: constantValues.trim()
                                ? constantValues.split(',').map(v => v.trim())
                                : []
                        }
                        : c
                ),
                constantDraft: { name: "", values: [] },
                constantValues: "",
                editingConstant: null,
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.constantName;
                    return newErrors;
                })()
            }));
        }
    };

    handleCancelEditConstant = () => {
        this.setState(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors.constantName;
            return {
                constantDraft: { name: "", values: [] },
                constantValues: "",
                editingConstant: null,
                errors: newErrors
            };
        });
    };

    handleAddParam = () => {
        const { paramDraft, params } = this.state;
        const isNameValid = this.validateInput('paramName', paramDraft.name, 'param');
        const isTypeValid = this.validateInput('paramType', paramDraft.type, 'param');

        if (isNameValid && isTypeValid) {
            const isDuplicate = params.some(p => p.name === paramDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, paramName: 'Parameter name already exists' } }));
                return;
            }

            this.setState(prev => ({
                params: [...prev.params, {
                    ...paramDraft,
                    id: this.generateId(),
                    name: paramDraft.name.trim(),
                    type: paramDraft.type.trim()
                }],
                paramDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PRIVATE,
                    isFinal: true,
                    isStatic: false
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

    handleEditParam = (id: string) => {
        const { params } = this.state;
        const param = params.find(p => p.id === id);
        if (param) {
            this.setState({
                paramDraft: {
                    name: param.name,
                    type: param.type,
                    visibility: param.visibility,
                    isFinal: param.isFinal || false,
                    isStatic: param.isStatic || false
                },
                editingParam: id
            });
        }
    };

    handleUpdateParam = () => {
        const { paramDraft, params, editingParam } = this.state;
        if (!editingParam) return;

        const isNameValid = this.validateInput('paramName', paramDraft.name, 'param');
        const isTypeValid = this.validateInput('paramType', paramDraft.type, 'param');

        if (isNameValid && isTypeValid) {
            const isDuplicate = params.some(p => p.name === paramDraft.name.trim() && p.id !== editingParam);
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, paramName: 'Parameter name already exists' } }));
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
                    isFinal: true,
                    isStatic: false
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

    handleCancelEditParam = () => {
        this.setState(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors.paramName;
            delete newErrors.paramType;
            return {
                paramDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PRIVATE,
                    isFinal: true,
                    isStatic: false
                },
                editingParam: null,
                errors: newErrors
            };
        });
    };

    handleAddMethod = () => {
        const { methodDraft, methods } = this.state;
        const isNameValid = this.validateInput('methodName', methodDraft.name, 'method');
        const isTypeValid = this.validateInput('methodType', methodDraft.returnType, 'method');

        if (isNameValid && isTypeValid) {
            const isDuplicate = methods.some(m => m.name === methodDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, methodName: 'Method name already exists' } }));
                return;
            }

            this.setState(prev => ({
                methods: [...prev.methods, {
                    ...methodDraft,
                    id: this.generateId(),
                    name: methodDraft.name.trim(),
                    returnType: methodDraft.returnType.trim()
                }],
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

    handleQuickAddMethod = (name: string, returnType: string) => {
        const { methods } = this.state;
        const isDuplicate = methods.some(m => m.name === name);

        if (!isDuplicate) {
            this.setState(prev => ({
                methods: [...prev.methods, {
                    id: this.generateId(),
                    name: name,
                    returnType: returnType,
                    visibility: Visibility.PUBLIC,
                    isStatic: false
                }]
            }));
        }
    };

    handleEditMethod = (id: string) => {
        const { methods } = this.state;
        const method = methods.find(m => m.id === id);
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

    handleUpdateMethod = () => {
        const { methodDraft, methods, editingMethod } = this.state;
        if (!editingMethod) return;

        const isNameValid = this.validateInput('methodName', methodDraft.name, 'method');
        const isTypeValid = this.validateInput('methodType', methodDraft.returnType, 'method');

        if (isNameValid && isTypeValid) {
            const isDuplicate = methods.some(m => m.name === methodDraft.name.trim() && m.id !== editingMethod);
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, methodName: 'Method name already exists' } }));
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

    handleCancelEditMethod = () => {
        this.setState(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors.methodName;
            delete newErrors.methodType;
            return {
                methodDraft: {
                    name: "",
                    returnType: "",
                    visibility: Visibility.PUBLIC,
                    isStatic: false
                },
                editingMethod: null,
                errors: newErrors
            };
        });
    };

    handleAddConstructor = () => {
        const { params, constructors } = this.state;
        if (params.length === 0) {
            this.setState(prev => ({ errors: { ...prev.errors, constructor: 'Add fields first to create a constructor' } }));
            return;
        }

        const constructorName = this.state.enumName.trim() || 'Constructor';
        const isDuplicate = constructors.some(c =>
            c.params.length === params.length &&
            c.params.every((p, i) => p.type === params[i]?.type)
        );

        if (isDuplicate) {
            this.setState(prev => ({ errors: { ...prev.errors, constructor: 'Constructor with same parameters already exists' } }));
            return;
        }

        this.setState(prev => {
            const { constructor: _constructorError, ...remainingErrors } = prev.errors;
            return {
                constructors: [...prev.constructors, {
                    id: this.generateId(),
                    name: constructorName,
                    params: [...params]
                }],
                errors: remainingErrors
            };
        });
    };

    handleRemoveConstant = (id: string) => {
        this.setState(prev => ({
            enumConstants: prev.enumConstants.filter(c => c.id !== id)
        }));
        if (this.state.editingConstant === id) {
            this.handleCancelEditConstant();
        }
    };

    handleRemoveParam = (id: string) => {
        this.setState(prev => ({
            params: prev.params.filter(p => p.id !== id)
        }));
        if (this.state.editingParam === id) {
            this.handleCancelEditParam();
        }
    };

    handleRemoveMethod = (id: string) => {
        this.setState(prev => ({
            methods: prev.methods.filter(m => m.id !== id)
        }));
        if (this.state.editingMethod === id) {
            this.handleCancelEditMethod();
        }
    };

    handleRemoveConstructor = (id: string) => {
        this.setState(prev => ({
            constructors: prev.constructors.filter(c => c.id !== id)
        }));
    };

    handleAddEnum = () => {
        const { enumName, enumConstants, params, methods, constructors } = this.state;
        const { onAdd, onClose } = this.props;
        const isEnumNameValid = this.validateInput('enumName', enumName, 'enum');
        if (!isEnumNameValid) return;
        if (enumConstants.length === 0) {
            this.setState(prev => ({ errors: { ...prev.errors, enumConstants: 'Add at least one enum constant' } }));
            return;
        }
        const finalEnumName = enumName.trim() || `Enum${this.idRef.current}`;
        const id = `enum-${this.idRef.current++}`;
        const newEnum = (
            <Enumeration
                key={id}
        name={finalEnumName}
        x={100}
        y={100}
        draggable={true}
        constants={enumConstants.map(c => ({
                name: c.name,
                values: c.values
            }))}
        params={params}
        methods={methods}
        constructors={constructors}
        />
    );
        onAdd(newEnum);
        this.setState({
            enumName: "",
            enumConstants: [],
            params: [],
            methods: [],
            constructors: [],
            errors: {},
            editingConstant: null,
            editingParam: null,
            editingMethod: null,
            constantDraft: { name: "", values: [] },
            constantValues: "",
            paramDraft: {
                name: "",
                type: "",
                visibility: Visibility.PRIVATE,
                isFinal: true,
                isStatic: false
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
            enumName, enumConstants, params, constructors, methods, errors,
            editingConstant, editingParam, editingMethod, constantDraft, constantValues, paramDraft, methodDraft
        } = this.state;
        const { initialData } = this.props;
        const isFormValid = enumName.trim() && enumConstants.length > 0 && Object.keys(errors).length === 0;

        return (
            <div className="absolute top-4 left-4 p-6 bg-white rounded-lg shadow-lg w-[38rem] space-y-6 overflow-y-auto max-h-[90vh] z-10 border" style={{overflowY: "auto"}}>
        {/* Header */}
        <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
            Create New Enum
        {initialData?.template && (
            <span className="text-sm text-orange-600 ml-2">({initialData.template})</span>
        )}
        </h2>
        {this.props.onClose && (
            <button
                onClick={this.props.onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
                >
                            ×
                        </button>
        )}
        </div>

        {/* Auto-population indicator */}
        {initialData && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-orange-800 mb-1">✨ Auto-Population Active</h4>
        <div className="text-xs text-orange-700">
            Pre-filled with {initialData.constants?.length || 0} constants,
            {initialData.params?.length || 0} fields, and
            {initialData.methods?.length || 0} methods
        </div>
        </div>
        )}

        {/* Quick Patterns */}
        <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Common Enum Patterns</h3>
        <div className="grid grid-cols-4 gap-2">
            {[
                    { id: 'status', label: 'Status', description: 'Active/Inactive states' },
        { id: 'priority', label: 'Priority', description: 'Low/Medium/High levels' },
        { id: 'color', label: 'Color', description: 'RGB color values' },
        { id: 'day', label: 'Day', description: 'Days of the week' },
        { id: 'size', label: 'Size', description: 'S/M/L/XL sizes' },
        { id: 'operation', label: 'Operation', description: 'Math operations' },
        { id: 'http-status', label: 'HTTP Status', description: 'HTTP response codes' }
    ].map(pattern => (
            <button
                key={pattern.id}
        onClick={() => this.applyCommonPatterns(pattern.id)}
        className="p-2 text-xs bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded text-center"
        title={pattern.description}
            >
            {pattern.label}
            </button>
    ))}
        </div>
        </div>

        {/* Enum Name */}
        <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Enum Name *</label>
        <input
        type="text"
        placeholder="Enter enum name (e.g., Status, Priority, Color)"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            errors.enumName ? 'border-red-300' : 'border-gray-300'
        }`}
        value={enumName}
        onChange={(e) => {
            this.setState({ enumName: e.target.value });
            if (errors.enumName) {
                this.validateInput('enumName', e.target.value, 'enum');
            }
        }}
        onBlur={() => this.validateInput('enumName', enumName, 'enum')}
        onKeyPress={(e) => this.handleKeyPress(e, this.handleAddEnum)}
        />
        {errors.enumName && (
            <p className="text-xs text-red-500">{errors.enumName}</p>
        )}
        <p className="text-xs text-gray-500">
            Use PascalCase for enum names (e.g., Color, Priority, Status)
        </p>
        </div>

        {/* Smart Constant Suggestions */}
        {enumName && this.suggestConstantsFromName().length > 0 && (
            <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Suggested Constants</h4>
        <div className="flex flex-wrap gap-2">
            {this.suggestConstantsFromName().map(constant => (
                    <button
                        key={constant}
                onClick={() => this.handleQuickAddConstant(constant)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
            disabled={enumConstants.some(c => c.name === constant)}
                >
                + {constant}
                </button>
        ))}
            </div>
            </div>
        )}

        {/* Enum Constants Section */}
        <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Enum Constants *</h3>
        <p className="text-xs text-gray-500">
            Constants should be in UPPER_CASE and represent the possible values
        </p>

        {/* Add/Edit Constant Form */}
        <div className="space-y-2">
        <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
        <input
            type="text"
        placeholder="Constant Name (e.g., ACTIVE, HIGH_PRIORITY)"
        value={constantDraft.name}
        onChange={(e) => this.setState({ constantDraft: { ...constantDraft, name: e.target.value.toUpperCase() } })}
        onKeyPress={(e) => this.handleKeyPress(e, editingConstant ? this.handleUpdateConstant : this.handleAddConstant)}
        className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            errors.constantName ? 'border-red-300' : 'border-gray-300'
        }`}
        />
        <input
        type="text"
        placeholder="Constructor Values (optional, comma-separated: value1, value2)"
        value={constantValues}
        onChange={(e) => this.setState({ constantValues: e.target.value })}
        onKeyPress={(e) => this.handleKeyPress(e, editingConstant ? this.handleUpdateConstant : this.handleAddConstant)}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            </div>

            <p className="text-xs text-gray-500">
            Example: RED(255, 0, 0) - enter: 255, 0, 0
        </p>
        </div>

        {errors.constantName && (
            <p className="text-xs text-red-500">{errors.constantName}</p>
        )}

        <div className="flex gap-2">
            {editingConstant ? (
                        <>
                            <button
                                onClick={this.handleUpdateConstant}
                    className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                        >
                                        ✓ Update Constant
        </button>
        <button
        onClick={this.handleCancelEditConstant}
        className="text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
            >
                                        ✗ Cancel
        </button>
        </>
    ) : (
            <button
                onClick={this.handleAddConstant}
        className="text-sm text-orange-600 hover:text-orange-800 hover:underline font-medium"
            >
            + Add Constant
        </button>
    )}
        </div>
        </div>

        {/* Constants List */}
        {enumConstants.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
            {enumConstants.map((constant) => (
                    <div key={constant.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                    editingConstant === constant.id ? 'bg-orange-100 border border-orange-200' : 'bg-orange-50'
                }`}>
            <span className="flex-1">
            <span className="font-medium text-orange-800">{constant.name}</span>
            {constant.values && constant.values.length > 0 && (
                <span className="text-gray-600">({constant.values.join(', ')})</span>
            )}
            </span>
            <div className="flex gap-1">
        <button
            onClick={() => this.handleEditConstant(constant.id)}
            className="text-orange-500 hover:text-orange-700 text-xs"
            aria-label="Edit constant"
                >
                                            ✎
                                        </button>
                                        <button
            onClick={() => this.handleRemoveConstant(constant.id)}
            className="text-red-500 hover:text-red-700"
            aria-label="Remove constant"
                >
                                            ×
                                        </button>
                                        </div>
                                        </div>
        ))}
            </div>
        )}

        {errors.enumConstants && (
            <p className="text-xs text-red-500">{errors.enumConstants}</p>
        )}
        </div>

        {/* Fields Section */}
        <div className="space-y-3">
        <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Fields (Optional)</h3>
            <div className="flex gap-2">
        <button
            onClick={() => {
            this.setState(prev => ({ params: [...prev.params, {
                    id: this.generateId(),
                    name: 'value',
                    type: 'String',
                    visibility: Visibility.PRIVATE,
                    isFinal: true,
                    isStatic: false
                }] }));
        }}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
        disabled={params.some(p => p.name === 'value')}
            >
            + value
            </button>
            <button
        onClick={() => {
            this.setState(prev => ({ params: [...prev.params, {
                    id: this.generateId(),
                    name: 'code',
                    type: 'int',
                    visibility: Visibility.PRIVATE,
                    isFinal: true,
                    isStatic: false
                }] }));
        }}
        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
        disabled={params.some(p => p.name === 'code')}
            >
            + code
            </button>
            </div>
            </div>
            <p className="text-xs text-gray-500">
            Fields store data associated with each enum constant
        </p>

        {/* Add/Edit Field Form */}
        <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
        <input
            type="text"
        placeholder="Field Name"
        value={paramDraft.name}
        onChange={(e) => this.setState({ paramDraft: { ...paramDraft, name: e.target.value } })}
        onKeyPress={(e) => this.handleKeyPress(e, editingParam ? this.handleUpdateParam : this.handleAddParam)}
        className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            errors.paramName ? 'border-red-300' : 'border-gray-300'
        }`}
        />
        <input
        type="text"
        placeholder="Type"
        value={paramDraft.type}
        onChange={(e) => this.setState({ paramDraft: { ...paramDraft, type: e.target.value } })}
        onKeyPress={(e) => this.handleKeyPress(e, editingParam ? this.handleUpdateParam : this.handleAddParam)}
        className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
            errors.paramType ? 'border-red-300' : 'border-gray-300'
        }`}
        />
        <select
        value={paramDraft.visibility}
        onChange={(e) => this.setState({ paramDraft: { ...paramDraft, visibility: e.target.value as Visibility } })}
        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
        <option value={Visibility.PRIVATE}>private</option>
            <option value={Visibility.PUBLIC}>public</option>
            <option value={Visibility.PROTECTED}>protected</option>
            </select>
            </div>

        {/* Field Modifiers */}
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
                                        ✓ Update Field
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
        className="text-sm text-orange-600 hover:text-orange-800 hover:underline font-medium"
            >
            + Add Field
        </button>
    )}
        </div>
        </div>

        {/* Fields List */}
        {params.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
            {params.map((param) => (
                    <div key={param.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                    editingParam === param.id ? 'bg-orange-100 border border-orange-200' : 'bg-gray-50'
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
                    className="text-orange-500 hover:text-orange-700 text-xs"
                    aria-label="Edit field"
                        >
                                            ✎
                                        </button>
                                        <button
                    onClick={() => this.handleRemoveParam(param.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove field"
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
            <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Methods (Optional)</h3>
                <div className="flex gap-2">
            {params.length > 0 && (
                    <>
                        <button
                            onClick={() => this.handleQuickAddMethod('getValue', params[0]?.type || 'Object')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
            disabled={methods.some(m => m.name === 'getValue')}
                >
                + getValue
                </button>
                <button
            onClick={() => this.handleQuickAddMethod('getDisplayName', 'String')}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
            disabled={methods.some(m => m.name === 'getDisplayName')}
                >
                + getDisplayName
                </button>
                </>
        )}
            <button
                onClick={() => this.handleQuickAddMethod('fromString', enumName)}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
            disabled={methods.some(m => m.name === 'fromString')}
                >
                + fromString
                </button>
                </div>
                </div>

            {/* Add/Edit Method Form */}
            <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
            <input
                type="text"
            placeholder="Method Name"
            value={methodDraft.name}
            onChange={(e) => this.setState({ methodDraft: { ...methodDraft, name: e.target.value } })}
            onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
            className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                errors.methodName ? 'border-red-300' : 'border-gray-300'
            }`}
            />
            <input
            type="text"
            placeholder="Return Type"
            value={methodDraft.returnType}
            onChange={(e) => this.setState({ methodDraft: { ...methodDraft, returnType: e.target.value } })}
            onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
            className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                errors.methodType ? 'border-red-300' : 'border-gray-300'
            }`}
            />
            <select
            value={methodDraft.visibility}
            onChange={(e) => this.setState({ methodDraft: { ...methodDraft, visibility: e.target.value as Visibility } })}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
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
            className="text-sm text-orange-600 hover:text-orange-800 hover:underline font-medium"
                >
                + Add Method
        </button>
        )}
            </div>
            </div>

            {/* Methods List */}
            {methods.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                {methods.map((method) => (
                        <div key={method.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                        editingMethod === method.id ? 'bg-orange-100 border border-orange-200' : 'bg-gray-50'
                    }`}>
                <span className="flex-1">
                <span className="text-gray-500">{method.visibility}</span>
                {method.isStatic && <span className="text-blue-600 ml-1">static</span>}
                    <span className="ml-1">{method.name}(): {method.returnType}</span>
                </span>
                <div className="flex gap-1">
                <button
                    onClick={() => this.handleEditMethod(method.id)}
                    className="text-orange-500 hover:text-orange-700 text-xs"
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
                <h3 className="text-sm font-semibold text-gray-700">Constructors (Optional)</h3>
                    <p className="text-xs text-gray-500">
                Constructors are private in enums and initialize fields
            </p>

            <div className="space-y-2">
            <button
                onClick={this.handleAddConstructor}
                className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                disabled={params.length === 0}
                    >
                    + Use current fields as constructor
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
                                <span className="text-gray-500">private</span> {constructor.name}({constructor.params.map(p => `${p.name}: ${p.type}`).join(', ')})
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

                {/* Enum Guidelines */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-orange-800 mb-2">Enum Best Practices</h4>
            <ul className="text-xs text-orange-700 space-y-1">
                <li>• Enum constants should be in UPPER_CASE</li>
            <li>• Constructors are always private in enums</li>
            <li>• Each constant can have constructor arguments</li>
            <li>• Use enums for fixed sets of constants that won&apos;t change</li>
            <li>• Consider adding utility methods like fromString() for parsing</li>
                                                                        <li>• Enums are implicitly final and extend java.lang.Enum</li>
            </ul>
            </div>

                {/* Common Enum Examples */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Common Enum Patterns</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <strong>Simple Enums:</strong>
            <ul className="text-gray-600 mt-1">
                <li>• Status (ACTIVE, INACTIVE)</li>
            <li>• Priority (LOW, HIGH)</li>
            <li>• Direction (NORTH, SOUTH)</li>
            </ul>
            </div>
            <div>
            <strong>Complex Enums:</strong>
            <ul className="text-gray-600 mt-1">
                <li>• Color with RGB values</li>
            <li>• Operation with behavior</li>
            <li>• Planet with mass/radius</li>
            </ul>
            </div>
            </div>
            </div>

            {/* Usage Examples */}
                {enumName && enumConstants.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Usage Examples</h4>
                <div className="text-xs text-blue-700 space-y-1 font-mono">
                    <div>{`// Usage examples:`}</div>
                        <div>{enumName} status = {enumName}.{enumConstants[0].name};</div>
                    {params.length > 0 && methods.length > 0 && (
                        <>
                            <div>String value = status.{methods[0]?.name || 'getValue'}();</div>
                    <div>{`// Switch statement:`}</div>
                    <div>switch (status) {`{`}</div>
                    {enumConstants.slice(0, 2).map((constant, index) => (
                    <div key={index} className="ml-4">
                    case {constant.name}: {`// handle ${constant.name.toLowerCase()}; break;`}
                    </div>
                    ))}
                    <div>{`}`}</div>
                    </>
                    )}
                    </div>
                    </div>
                )}

                {/* Preview */}
                {enumName && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="bg-white rounded border" style={{ minHeight: '150px' }}>
                    <svg width="100%" height="200" viewBox="0 0 280 200">
                <Enumeration
                    key={`preview-${enumConstants.length}-${params.length}-${methods.length}-${constructors.length}-${enumName}`}
                    x={10}
                    y={10}
                    name={enumName}
                    draggable={false}
                    constants={enumConstants.map(c => ({
                            name: c.name,
                            values: c.values
                        }))}
                    params={params}
                    constructors={constructors}
                    methods={methods}
                    />
                    </svg>
                    </div>
                    </div>
                )}

                {/* Enum Summary */}
                {(enumConstants.length > 0 || params.length > 0 || methods.length > 0) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Enum Summary</h4>
                <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Constants:</strong> {enumConstants.length}</div>
                <div><strong>Fields:</strong> {params.length}</div>
                <div><strong>Methods:</strong> {methods.length}</div>
                <div><strong>Constructors:</strong> {constructors.length}</div>
                {enumConstants.some(c => c.values && c.values.length > 0) && (
                        <div><strong>With Values:</strong> {enumConstants.filter(c => c.values && c.values.length > 0).length} constants</div>
                )}
                    </div>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={this.handleAddEnum}
                disabled={!isFormValid}
                className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
                    isFormValid
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
                {initialData ? 'Create Enum with Auto-Population' : 'Create Enum'}
                </button>
                </div>
            );
            }
        }
