import React from "react";
import { CreateRecordProps, CreateRecordState } from "@/public/components/window/record/properties";
import Visibility from "@/public/components/visibility";
import Record from "@/public/components/record/record";
import ObjectCreator from "@/public/components/window/ObjectCreator";

export default class CreateRecord extends ObjectCreator<CreateRecordProps, CreateRecordState> {

    constructor(props: CreateRecordProps) {
        super(props);
        this.state = {
            recordName: "",
            components: [],
            methods: [],
            errors: {},

            // Editing states
            editingComponent: null,
            editingMethod: null,

            componentDraft: {
                name: "",
                type: "",
                visibility: Visibility.PUBLIC,
                isStatic: false,
                isFinal: true // Record components are implicitly final
            },

            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            }
        };
    }

    componentDidUpdate(prevProps: CreateRecordProps) {
        // Auto-populate if initialData changes after mount
        if (
            this.props.initialData &&
            this.props.initialData !== prevProps.initialData
        ) {
            const { initialData } = this.props;
            if (initialData.className) this.setState({ recordName: initialData.className });
            if (initialData.params) {
                this.setState({
                    components: initialData.params.map(p => ({
                        ...p,
                        id: `component-${Date.now()}-${Math.random()}`
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
        }
    }

    // Quick template methods for common record patterns
    applyCommonPatterns = (pattern: string) => {
        switch (pattern) {
            case 'person':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'firstName', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'lastName', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'email', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'age', type: 'int', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'fullName', returnType: 'String', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isAdult', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'coordinate':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'x', type: 'double', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'y', type: 'double', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'z', type: 'double', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'distanceTo', returnType: 'double', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'magnitude', returnType: 'double', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'normalize', returnType: this.state.recordName || 'Point3D', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'money':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'amount', type: 'BigDecimal', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'currency', type: 'Currency', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'add', returnType: 'Money', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'subtract', returnType: 'Money', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'multiply', returnType: 'Money', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isZero', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'address':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'street', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'city', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'state', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'zipCode', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'country', type: 'String', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'formatForMailing', returnType: 'String', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isInCountry', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'range':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'start', type: 'T', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'end', type: 'T', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'contains', returnType: 'boolean', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'length', returnType: 'long', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isEmpty', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'dto':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'id', type: 'Long', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'name', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'createdAt', type: 'LocalDateTime', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'updatedAt', type: 'LocalDateTime', visibility: Visibility.PUBLIC, isFinal: true }
                    ]
                });
                break;

            case 'result':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'value', type: 'T', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'success', type: 'boolean', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'error', type: 'String', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'isSuccess', returnType: 'boolean', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'isFailure', returnType: 'boolean', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'getValueOrThrow', returnType: 'T', visibility: Visibility.PUBLIC }
                    ]
                });
                break;

            case 'event':
                this.setState({
                    components: [
                        { id: this.generateId(), name: 'type', type: 'String', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'timestamp', type: 'Instant', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'data', type: 'Map<String, Object>', visibility: Visibility.PUBLIC, isFinal: true },
                        { id: this.generateId(), name: 'source', type: 'String', visibility: Visibility.PUBLIC, isFinal: true }
                    ],
                    methods: [
                        { id: this.generateId(), name: 'getData', returnType: 'T', visibility: Visibility.PUBLIC },
                        { id: this.generateId(), name: 'hasData', returnType: 'boolean', visibility: Visibility.PUBLIC }
                    ]
                });
                break;
        }
    };

    suggestComponentType = (componentName: string): string => {
        const name = componentName.toLowerCase();

        // Common patterns for record components
        if (name.includes('id')) return 'Long';
        if (name.includes('name') || name.includes('title') || name.includes('description')) return 'String';
        if (name.includes('email') || name.includes('url') || name.includes('phone')) return 'String';
        if (name.includes('count') || name.includes('size') || name.includes('age')) return 'int';
        if (name.includes('price') || name.includes('amount') || name.includes('cost')) return 'BigDecimal';
        if (name.includes('date') || name.includes('time')) return 'LocalDateTime';
        if (name.includes('timestamp')) return 'Instant';
        if (name.includes('active') || name.includes('enabled') || name.includes('valid')) return 'boolean';
        if (name.includes('coordinate') || name.includes('position')) return 'double';
        if (name.includes('percentage') || name.includes('ratio')) return 'double';
        if (name.includes('list') || name.includes('items')) return 'List<String>';
        if (name.includes('map') || name.includes('properties')) return 'Map<String, Object>';

        return 'String'; // Default
    };

    suggestRecordName = () => {
        const { components } = this.state;
        if (components.length === 0) return '';

        // Suggest name based on components
        const hasCoordinates = components.some(c => ['x', 'y', 'z'].includes(c.name.toLowerCase()));
        if (hasCoordinates) return 'Point';

        const hasPersonData = components.some(c => ['firstName', 'lastName', 'name'].includes(c.name.toLowerCase()));
        if (hasPersonData) return 'Person';

        const hasAddressData = components.some(c => ['street', 'city', 'address'].includes(c.name.toLowerCase()));
        if (hasAddressData) return 'Address';

        const hasMoneyData = components.some(c => ['amount', 'currency', 'price'].includes(c.name.toLowerCase()));
        if (hasMoneyData) return 'Money';

        const hasRangeData = components.some(c => ['start', 'end', 'from', 'to'].includes(c.name.toLowerCase()));
        if (hasRangeData) return 'Range';

        return '';
    };

    handleAddComponent = () => {
        const { componentDraft, components } = this.state;
        const isNameValid = this.validateInput('componentName', componentDraft.name, 'component');
        const isTypeValid = this.validateInput('componentType', componentDraft.type, 'component');

        if (isNameValid && isTypeValid) {
            const isDuplicate = components.some(c => c.name === componentDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, componentName: 'Component name already exists' } }));
                return;
            }

            this.setState(prev => ({
                components: [...prev.components, {
                    ...componentDraft,
                    id: this.generateId(),
                    name: componentDraft.name.trim(),
                    type: componentDraft.type.trim()
                }],
                componentDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PUBLIC,
                    isStatic: false,
                    isFinal: true
                },
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.componentName;
                    delete newErrors.componentType;
                    return newErrors;
                })()
            }));
        }
    };

    handleQuickAddComponent = (name: string, type?: string) => {
        const { components } = this.state;
        const isDuplicate = components.some(c => c.name === name);

        if (!isDuplicate) {
            this.setState(prev => ({
                components: [...prev.components, {
                    id: this.generateId(),
                    name: name,
                    type: type || this.suggestComponentType(name),
                    visibility: Visibility.PUBLIC,
                    isStatic: false,
                    isFinal: true
                }]
            }));
        }
    };

    handleEditComponent = (id: string) => {
        const { components } = this.state;
        const component = components.find(c => c.id === id);
        if (component) {
            this.setState({
                componentDraft: {
                    name: component.name,
                    type: component.type,
                    visibility: component.visibility || Visibility.PUBLIC,
                    isStatic: component.isStatic || false,
                    isFinal: component.isFinal !== false // Default to true for records
                },
                editingComponent: id
            });
        }
    };

    handleUpdateComponent = () => {
        const { componentDraft, components, editingComponent } = this.state;
        if (!editingComponent) return;

        const isNameValid = this.validateInput('componentName', componentDraft.name, 'component');
        const isTypeValid = this.validateInput('componentType', componentDraft.type, 'component');

        if (isNameValid && isTypeValid) {
            const isDuplicate = components.some(c => c.name === componentDraft.name.trim() && c.id !== editingComponent);
            if (isDuplicate) {
                this.setState(prev => ({ errors: { ...prev.errors, componentName: 'Component name already exists' } }));
                return;
            }

            this.setState(prev => ({
                components: prev.components.map(c =>
                    c.id === editingComponent
                        ? {
                            ...componentDraft,
                            id: c.id,
                            name: componentDraft.name.trim(),
                            type: componentDraft.type.trim()
                        }
                        : c
                ),
                componentDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PUBLIC,
                    isStatic: false,
                    isFinal: true
                },
                editingComponent: null,
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.componentName;
                    delete newErrors.componentType;
                    return newErrors;
                })()
            }));
        }
    };

    handleCancelEditComponent = () => {
        this.setState({
            componentDraft: {
                name: "",
                type: "",
                visibility: Visibility.PUBLIC,
                isStatic: false,
                isFinal: true
            },
            editingComponent: null,
            errors: (() => {
                const newErrors = { ...this.state.errors };
                delete newErrors.componentName;
                delete newErrors.componentType;
                return newErrors;
            })()
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
        this.setState({
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            },
            editingMethod: null,
            errors: (() => {
                const newErrors = { ...this.state.errors };
                delete newErrors.methodName;
                delete newErrors.methodType;
                return newErrors;
            })()
        });
    };

    handleRemoveComponent = (id: string) => {
        const { editingComponent } = this.state;
        this.setState(prev => ({
            components: prev.components.filter(c => c.id !== id)
        }));
        if (editingComponent === id) {
            this.handleCancelEditComponent();
        }
    };

    handleRemoveMethod = (id: string) => {
        const { editingMethod } = this.state;
        this.setState(prev => ({
            methods: prev.methods.filter(m => m.id !== id)
        }));
        if (editingMethod === id) {
            this.handleCancelEditMethod();
        }
    };

    handleAddRecord = () => {
        const { recordName, components, methods } = this.state;
        const { onAdd, onClose } = this.props;
        const isRecordNameValid = this.validateInput('recordName', recordName, 'record');

        if (!isRecordNameValid) {
            return;
        }

        if (components.length === 0) {
            this.setState(prev => ({ errors: { ...prev.errors, components: 'Add at least one record component' } }));
            return;
        }

        const finalRecordName = recordName.trim() || this.suggestRecordName() || `Record${this.idRef.current}`;
        const id = `record-${this.idRef.current++}`;

        // Convert components to params format that Record class expects
        const paramsForRecord = components.map(component => ({
            name: component.name,
            type: component.type,
            visibility: component.visibility || Visibility.PUBLIC,
            isStatic: component.isStatic || false,
            isFinal: component.isFinal !== false // Records components are final by default
        }));

        const newRecord = (
            <Record
                key={id}
                name={finalRecordName}
                x={100}
                y={100}
                draggable={true}
                params={paramsForRecord}
                methods={methods}
            />
        );

        onAdd(newRecord);

        // Reset form
        this.setState({
            recordName: "",
            components: [],
            methods: [],
            errors: {},
            editingComponent: null,
            editingMethod: null,
            componentDraft: {
                name: "",
                type: "",
                visibility: Visibility.PUBLIC,
                isStatic: false,
                isFinal: true
            },
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false
            }
        });

        // Close modal if close handler provided
        onClose?.();
    };

    // Get common components based on record name
    getCommonComponents = () => {
        const { recordName } = this.state;
        const name = recordName.toLowerCase();
        const suggestions: Array<{ name: string, type: string }> = [];

        if (name.includes('person') || name.includes('user')) {
            suggestions.push(
                { name: 'firstName', type: 'String' },
                { name: 'lastName', type: 'String' },
                { name: 'email', type: 'String' }
            );
        }
        if (name.includes('address')) {
            suggestions.push(
                { name: 'street', type: 'String' },
                { name: 'city', type: 'String' },
                { name: 'zipCode', type: 'String' }
            );
        }
        if (name.includes('point') || name.includes('coordinate')) {
            suggestions.push(
                { name: 'x', type: 'double' },
                { name: 'y', type: 'double' },
                { name: 'z', type: 'double' }
            );
        }
        if (name.includes('money') || name.includes('price')) {
            suggestions.push(
                { name: 'amount', type: 'BigDecimal' },
                { name: 'currency', type: 'Currency' }
            );
        }
        if (name.includes('range') || name.includes('interval')) {
            suggestions.push(
                { name: 'start', type: 'T' },
                { name: 'end', type: 'T' }
            );
        }

        return suggestions;
    };

    render() {
        const {
            recordName,
            components,
            methods,
            errors,
            editingComponent,
            editingMethod,
            componentDraft,
            methodDraft
        } = this.state;

        const { initialData, onClose } = this.props;

        const isFormValid = recordName.trim() && components.length > 0 && Object.keys(errors).length === 0;

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[90vh] border" style={{ overflowY: "auto" }}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Create New Record
                        {initialData?.template && (
                            <span className="text-sm text-teal-600 ml-2">({initialData.template})</span>
                        )}
                    </h2>
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

                {/* Auto-population indicator */}
                {initialData && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-teal-800 mb-1">✨ Auto-Population Active</h4>
                        <div className="text-xs text-teal-700">
                            Pre-filled with {initialData.params?.length || 0} components and
                            {initialData.methods?.length || 0} methods
                        </div>
                    </div>
                )}

                {/* Quick Patterns */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Record Patterns</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {[
                            { id: 'person', label: 'Person', description: 'Personal information' },
                            { id: 'coordinate', label: 'Point', description: 'X, Y, Z coordinates' },
                            { id: 'money', label: 'Money', description: 'Amount and currency' },
                            { id: 'address', label: 'Address', description: 'Street, city, zip' },
                            { id: 'range', label: 'Range', description: 'Start and end values' },
                            { id: 'dto', label: 'DTO', description: 'Data transfer object' },
                            { id: 'result', label: 'Result', description: 'Success/failure result' },
                            { id: 'event', label: 'Event', description: 'Event data structure' }
                        ].map(pattern => (
                            <button
                                key={pattern.id}
                                onClick={() => this.applyCommonPatterns(pattern.id)}
                                className="p-2 text-xs bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded text-center"
                                title={pattern.description}
                            >
                                {pattern.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Record Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Record Name *</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Enter record name"
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.recordName ? 'border-red-300' : 'border-gray-300'
                            }`}
                            value={recordName}
                            onChange={(e) => {
                                this.setState({ recordName: e.target.value });
                                if (errors.recordName) {
                                    this.validateInput('recordName', e.target.value, 'record');
                                }
                            }}
                            onBlur={() => this.validateInput('recordName', recordName, 'record')}
                            onKeyPress={(e) => this.handleKeyPress(e, this.handleAddRecord)}
                        />
                        {this.suggestRecordName() && (
                            <button
                                onClick={() => this.setState({ recordName: this.suggestRecordName() })}
                                className="px-3 py-2 text-sm bg-teal-100 hover:bg-teal-200 border border-teal-300 rounded"
                                title="Use suggested name"
                            >
                                {this.suggestRecordName()}
                            </button>
                        )}
                    </div>
                    {errors.recordName && (
                        <p className="text-xs text-red-500">{errors.recordName}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Records are immutable data classes (Java 14+)
                    </p>
                </div>

                {/* Smart Component Suggestions */}
                {recordName && this.getCommonComponents().length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Suggested Components</h4>
                        <div className="flex flex-wrap gap-2">
                            {this.getCommonComponents().map(component => (
                                <button
                                    key={component.name}
                                    onClick={() => this.handleQuickAddComponent(component.name, component.type)}
                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
                                    disabled={components.some(c => c.name === component.name)}
                                >
                                    + {component.name}: {component.type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Record Components Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Record Components *</h3>
                    <p className="text-xs text-gray-500">
                        Components are automatically final and generate accessors, equals(), hashCode(), and toString()
                    </p>

                    {/* Add/Edit Component Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Component Name"
                                value={componentDraft.name}
                                onChange={(e) => this.setState({ componentDraft: { ...componentDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingComponent ? this.handleUpdateComponent : this.handleAddComponent)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 ${errors.componentName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={componentDraft.type}
                                onChange={(e) => this.setState({ componentDraft: { ...componentDraft, type: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingComponent ? this.handleUpdateComponent : this.handleAddComponent)}
                                onBlur={() => {
                                    if (componentDraft.name && !componentDraft.type) {
                                        this.setState(prev => ({ componentDraft: { ...prev.componentDraft, type: this.suggestComponentType(prev.componentDraft.name) } }));
                                    }
                                }}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 ${errors.componentType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                        </div>

                        {/* Component Modifiers */}
                        <div className="flex gap-3 text-xs">
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={componentDraft.isStatic || false}
                                    onChange={(e) => this.setState({ componentDraft: { ...componentDraft, isStatic: e.target.checked } })}
                                    className="h-3 w-3"
                                />
                                static
                            </label>
                            <label className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    checked={componentDraft.isFinal !== false}
                                    onChange={(e) => this.setState({ componentDraft: { ...componentDraft, isFinal: e.target.checked } })}
                                    className="h-3 w-3"
                                    disabled // Records components are always final
                                />
                                final (always)
                            </label>
                        </div>

                        {(errors.componentName || errors.componentType) && (
                            <p className="text-xs text-red-500">
                                {errors.componentName || errors.componentType}
                            </p>
                        )}

                        <div className="flex gap-2">
                            {editingComponent ? (
                                <>
                                    <button
                                        onClick={this.handleUpdateComponent}
                                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                    >
                                        ✓ Update Component
                                    </button>
                                    <button
                                        onClick={this.handleCancelEditComponent}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
                                    >
                                        ✗ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={this.handleAddComponent}
                                    className="text-sm text-teal-600 hover:text-teal-800 hover:underline font-medium"
                                >
                                    + Add Component
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Components List */}
                    {components.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {components.map((component) => (
                                <div key={component.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${editingComponent === component.id ? 'bg-teal-100 border border-teal-200' : 'bg-teal-50'
                                }`}>
                                    <span className="flex-1">
                                        <span className="text-teal-700 font-medium">{component.name}</span>
                                        <span className="text-gray-600">: {component.type}</span>
                                        {component.isStatic && <span className="text-blue-600 ml-1">static</span>}
                                        <span className="text-purple-600 ml-1">final</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditComponent(component.id)}
                                            className="text-teal-500 hover:text-teal-700 text-xs"
                                            aria-label="Edit component"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => this.handleRemoveComponent(component.id)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Remove component"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.components && (
                        <p className="text-xs text-red-500">{errors.components}</p>
                    )}
                </div>

                {/* Generated Methods Info */}
                {components.length > 0 && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-teal-800 mb-2">Auto-Generated Methods</h4>
                        <div className="text-xs text-teal-700 space-y-1">
                            <div>• <strong>Accessors:</strong> {components.map(c => `${c.name}()`).join(', ')}</div>
                            <div>• <strong>Constructor:</strong> {recordName}({components.map(c => `${c.type} ${c.name}`).join(', ')})</div>
                            <div>• <strong>Methods:</strong> equals(), hashCode(), toString()</div>
                        </div>
                    </div>
                )}

                {/* Custom Methods Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">Custom Methods (Optional)</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => this.handleQuickAddMethod('validate', 'boolean')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
                                disabled={methods.some(m => m.name === 'validate')}
                            >
                                + validate
                            </button>
                            <button
                                onClick={() => this.handleQuickAddMethod('isEmpty', 'boolean')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
                                disabled={methods.some(m => m.name === 'isEmpty')}
                            >
                                + isEmpty
                            </button>
                            <button
                                onClick={() => this.handleQuickAddMethod('copy', recordName)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded"
                                disabled={methods.some(m => m.name === 'copy')}
                            >
                                + copy
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Add custom methods to extend record functionality
                    </p>

                    {/* Add/Edit Method Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Method Name"
                                value={methodDraft.name}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 ${errors.methodName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Return Type"
                                value={methodDraft.returnType}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, returnType: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 ${errors.methodType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={methodDraft.visibility}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, visibility: e.target.value as Visibility } })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value={Visibility.PRIVATE}>private</option>
                                <option value={Visibility.PUBLIC}>public</option>
                                <option value={Visibility.PROTECTED}>protected</option>
                            </select>
                        </div>

                        {/* Method Modifiers */}
                        <div className="flex items-center space-x-4 text-xs">
                            <label className="flex items-center space-x-1">
                                <input
                                    type="checkbox"
                                    checked={methodDraft.isStatic}
                                    onChange={(e) => this.setState({ methodDraft: { ...methodDraft, isStatic: e.target.checked } })}
                                    className="h-3 w-3 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-700">static</span>
                            </label>
                        </div>

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
                                    className="text-sm text-teal-600 hover:text-teal-800 hover:underline font-medium"
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
                                <div key={method.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${editingMethod === method.id ? 'bg-teal-100 border border-teal-200' : 'bg-gray-50'
                                }`}>
                                    <span className="flex-1">
                                        <span className="text-gray-500">{method.visibility}</span>
                                        {method.isStatic && <span className="text-blue-600 ml-1">static</span>}
                                        <span className="ml-1">{method.name}(): {method.returnType}</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditMethod(method.id)}
                                            className="text-teal-500 hover:text-teal-700 text-xs"
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

                {/* Record Guidelines */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-teal-800 mb-2">Record Best Practices</h4>
                    <ul className="text-xs text-teal-700 space-y-1">
                        <li>• Records are immutable by default</li>
                        <li>• All components are implicitly final</li>
                        <li>• Constructor, accessors, equals(), hashCode(), toString() are auto-generated</li>
                        <li>• Records cannot extend other classes (but can implement interfaces)</li>
                        <li>• Perfect for data transfer objects and value classes</li>
                        <li>• Use records for classes that are primarily data holders</li>
                    </ul>
                </div>

                {/* Preview */}
                {recordName && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="bg-white rounded border" style={{ minHeight: '150px' }}>
                            <svg width="100%" height="200" viewBox="0 0 280 200">
                                <Record
                                    key={`preview-${components.length}-${methods.length}-${recordName}`}
                                    x={10}
                                    y={10}
                                    name={recordName}
                                    draggable={false}
                                    params={components.map(component => ({
                                        name: component.name,
                                        type: component.type,
                                        visibility: component.visibility || Visibility.PUBLIC,
                                        isStatic: component.isStatic || false,
                                        isFinal: component.isFinal !== false
                                    }))}
                                    methods={methods}
                                />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={this.handleAddRecord}
                    disabled={!isFormValid}
                    className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${isFormValid
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {initialData ? 'Create Record with Auto-Population' : 'Create Record'}
                </button>
            </div>
        );
    }
}
