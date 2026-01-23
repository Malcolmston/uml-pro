import {CreateInterfaceProps, CreateInterfaceState} from "@/public/components/window/interface/properties";
import React from "react";
import ObjectCreator from "@/public/components/window/ObjectCreator";
import Visibility from "@/public/components/visibility";
import Interface from "@/public/components/Interface/Interface";

export default class CreateInterface extends ObjectCreator<CreateInterfaceProps, CreateInterfaceState> {
    constructor(props: CreateInterfaceProps) {
        super(props);
        const baseState: CreateInterfaceState = {
            interfaceName: "",
            constants: [],
            methods: [],
            errors: {},
            constantDraft: {
                name: "",
                type: "",
                visibility: Visibility.PUBLIC,
                isFinal: true,
                isStatic: true
            },
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isDefault: false,
                isStatic: false
            }
        };
        this.state = {
            ...baseState,
            ...this.seedInitialState(props.initialData)
        };
    }

    private seedInitialState(initialData?: CreateInterfaceProps['initialData']) {
        if (!initialData) return {};
        const seeded: Partial<CreateInterfaceState> = {};

        if (initialData.interfaceName) {
            seeded.interfaceName = initialData.interfaceName;
        } else if ((initialData as CreateInterfaceProps['initialData'] & { className?: string }).className) {
            seeded.interfaceName = (initialData as CreateInterfaceProps['initialData'] & { className?: string }).className || "";
        }

        if (initialData.constants) {
            seeded.constants = initialData.constants.map(c => ({
                ...c,
                id: `constant-${Date.now()}-${Math.random()}`
            }));
        }
        if (initialData.methods) {
            seeded.methods = initialData.methods.map(m => ({
                ...m,
                id: `method-${Date.now()}-${Math.random()}`
            }));
        }

        return seeded;
    }

    componentDidUpdate(prevProps: CreateInterfaceProps) {
        // Auto-populate if initialData changes after mount
        if (
            this.props.initialData &&
            this.props.initialData !== prevProps.initialData
        ) {
            const seeded = this.seedInitialState(this.props.initialData);
            if (Object.keys(seeded).length > 0) {
                this.setState(seeded as Pick<CreateInterfaceState, keyof CreateInterfaceState>);
            }
        }
    }


    handleAddConstant = () => {
        const { constantDraft, constants } = this.state;
        const isNameValid = this.validateInput('constantName', constantDraft.name, 'constant');
        const isTypeValid = this.validateInput('constantType', constantDraft.type, 'constant');
        if (isNameValid && isTypeValid) {
            const isDuplicate = constants.some(c => c.name === constantDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, constantName: 'Constant name already exists' }
                }));
                return;
            }
            this.setState(prev => ({
                constants: [
                    ...prev.constants,
                    {
                        ...constantDraft,
                        id: this.generateId(),
                        name: constantDraft.name.trim(),
                        type: constantDraft.type.trim()
                    }
                ],
                constantDraft: {
                    name: "",
                    type: "",
                    visibility: Visibility.PUBLIC,
                    isFinal: true,
                    isStatic: true
                },
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.constantName;
                    delete newErrors.constantType;
                    return newErrors;
                })()
            }));
        }
    };

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
                    isDefault: false,
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

    handleRemoveConstant = (id: string) => {
        this.setState(prev => ({
            constants: prev.constants.filter(c => c.id !== id)
        }));
    };

    handleRemoveMethod = (id: string) => {
        this.setState(prev => ({
            methods: prev.methods.filter(m => m.id !== id)
        }));
    };

    handleAddInterface = () => {
        const { interfaceName, constants, methods } = this.state;
        const { onAdd, onClose } = this.props;
        const isInterfaceNameValid = this.validateInput('interfaceName', interfaceName, 'interface');
        if (!isInterfaceNameValid) return;
        const finalInterfaceName = interfaceName.trim() || `Interface${this.idRef.current}`;
        const id = `interface-${this.idRef.current++}`;
        const newInterface = (
            <Interface
                key={id}
                name={finalInterfaceName}
                x={100}
                y={100}
                draggable={true}
                constants={constants}
                methods={methods}
            />
        );
        onAdd(newInterface);
        this.setState({
            interfaceName: "",
            constants: [],
            methods: [],
            errors: {},
            constantDraft: {
                name: "",
                type: "",
                visibility: Visibility.PUBLIC,
                isFinal: true,
                isStatic: true
            },
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isDefault: false,
                isStatic: false
            }
        });
        onClose?.();
    };


    render() {
        const { interfaceName, constants, methods, errors, constantDraft, methodDraft } = this.state;
        const { onClose } = this.props;
        const isFormValid = interfaceName.trim() && Object.keys(errors).length === 0;

        return (
            <div className="absolute top-4 left-4 p-6 bg-white rounded-lg shadow-lg w-[32rem] space-y-6 overflow-y-auto max-h-[90vh] z-10 border" style={{overflowY: "auto"}}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Interface</h2>
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

                {/* Interface Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Interface Name *</label>
                    <input
                        type="text"
                        placeholder="Enter interface name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.interfaceName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={interfaceName}
                        onChange={(e) => {
                            this.setState({ interfaceName: e.target.value });
                            if (errors.interfaceName) {
                                this.validateInput('interfaceName', e.target.value, 'interface');
                            }
                        }}
                        onBlur={() => this.validateInput('interfaceName', interfaceName, 'interface')}
                        onKeyPress={(e) => this.handleKeyPress(e, this.handleAddInterface)}
                    />
                    {errors.interfaceName && (
                        <p className="text-xs text-red-500">{errors.interfaceName}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Interface names typically start with &apos;I&apos; (e.g., IDrawable, IComparable)
                    </p>
                </div>

                {/* Constants Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Constants</h3>
                    <p className="text-xs text-gray-500">
                        Interface constants are implicitly public, static, and final
                    </p>

                    {/* Add Constant Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Constant Name"
                                value={constantDraft.name}
                                onChange={(e) => this.setState({ constantDraft: { ...constantDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, this.handleAddConstant)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    errors.constantName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={constantDraft.type}
                                onChange={(e) => this.setState({ constantDraft: { ...constantDraft, type: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, this.handleAddConstant)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    errors.constantType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                        </div>

                        {(errors.constantName || errors.constantType) && (
                            <p className="text-xs text-red-500">
                                {errors.constantName || errors.constantType}
                            </p>
                        )}

                        <button
                            onClick={this.handleAddConstant}
                            className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                        >
                            + Add Constant
                        </button>
                    </div>

                    {/* Constants List */}
                    {constants.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {constants.map((constant) => (
                                <div key={constant.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                                    <span>
                                        <span className="text-gray-500 text-xs">public static final</span> {constant.name}: {constant.type}
                                    </span>
                                    <button
                                        onClick={() => this.handleRemoveConstant(constant.id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        aria-label="Remove constant"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Methods Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Methods</h3>
                    <p className="text-xs text-gray-500">
                        Interface methods are implicitly public and abstract (unless marked default or static)
                    </p>

                    {/* Add Method Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Method Name"
                                value={methodDraft.name}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    errors.methodName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Return Type"
                                value={methodDraft.returnType}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, returnType: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                                    errors.methodType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                        </div>

                        {/* Method Modifiers */}
                        <div className="flex items-center space-x-4 text-sm">
                            <label className="flex items-center space-x-1">
                                <input
                                    type="checkbox"
                                    checked={methodDraft.isDefault}
                                    onChange={(e) => this.setState({
                                        methodDraft: {
                                            ...methodDraft,
                                            isDefault: e.target.checked,
                                            isStatic: e.target.checked ? false : methodDraft.isStatic
                                        }
                                    })}
                                    className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-700">default</span>
                            </label>
                            <label className="flex items-center space-x-1">
                                <input
                                    type="checkbox"
                                    checked={methodDraft.isStatic}
                                    onChange={(e) => this.setState({
                                        methodDraft: {
                                            ...methodDraft,
                                            isStatic: e.target.checked,
                                            isDefault: e.target.checked ? false : methodDraft.isDefault
                                        }
                                    })}
                                    className="h-3 w-3 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-700">static</span>
                            </label>
                        </div>

                        {(errors.methodName || errors.methodType) && (
                            <p className="text-xs text-red-500">
                                {errors.methodName || errors.methodType}
                            </p>
                        )}

                        <button
                            onClick={this.handleAddMethod}
                            className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                        >
                            + Add Method
                        </button>
                    </div>

                    {/* Methods List */}
                    {methods.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {methods.map((method) => (
                                <div key={method.id} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm">
                                    <span>
                                        <span className="text-gray-500 text-xs">
                                            public {method.isDefault ? 'default ' : method.isStatic ? 'static ' : 'abstract '}
                                        </span>
                                        {method.name}(): {method.returnType}
                                    </span>
                                    <button
                                        onClick={() => this.handleRemoveMethod(method.id)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        aria-label="Remove method"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Interface Guidelines */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Interface Guidelines</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                        <li>• All fields are implicitly public, static, and final</li>
                        <li>• All methods are implicitly public and abstract (unless default/static)</li>
                        <li>• Use default methods for shared implementation</li>
                        <li>• Use static methods for utility functions</li>
                        <li>• Interface names often start with &apos;I&apos; or end with &apos;-able&apos;</li>
                    </ul>
                </div>

                {/* Preview */}
                {interfaceName && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="bg-white rounded border" style={{ minHeight: '150px' }}>
                            <svg width="100%" height="200" viewBox="0 0 280 200">
                                <Interface
                                    key={`preview-${constants.length}-${methods.length}-${interfaceName}`}
                                    x={10}
                                    y={10}
                                    name={interfaceName}
                                    draggable={false}
                                    constants={constants}
                                    methods={methods}
                                />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={this.handleAddInterface}
                    disabled={!isFormValid}
                    className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
                        isFormValid
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Create Interface
                </button>
            </div>
        );
    }

}
