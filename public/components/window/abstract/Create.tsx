import { CreateAbstractProps } from "./properties";
import {CreateAbstractState} from "@/public/components/window/abstract/properties";
import Visibility from "@/public/components/visibility";
import Abstract from "@/public/components/abstract/Abstract";
import CreateClass from "@/public/components/window/class/Create";

export default class CreateAbstract extends CreateClass {
    constructor(props: CreateAbstractProps) {
        super(props as any);
        // Override methodDraft to include isAbstract
        this.state = {
            ...this.state,
            methodDraft: {
                name: "",
                returnType: "",
                visibility: Visibility.PUBLIC,
                isStatic: false,
                isAbstract: false
            }
        };
    }

    handleAddClass = () => {
        const { className, params, methods, constructors, autoGettersSetters } = this.state;
        const isClassNameValid = this.validateInput('className', className, 'class');
        if (!isClassNameValid) return;

        const finalClassName = className.trim() || `Abstract${this.idRef.current}`;
        const id = `abstract-${this.idRef.current++}`;

        const newAbstract = (
            <Abstract
                key={id}
                name={finalClassName}
                x={100}
                y={100}
                draggable={true}
                params={params}
                methods={methods}
                constructors={constructors}
                autoGettersSetters={autoGettersSetters}
            />
        );

        this.props.onAdd(newAbstract);

        // Reset form
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
                isStatic: false,
                isAbstract: false
            }
        });

        this.props.onClose?.();
    };

    renderModifierCheckboxes(
        item: { isStatic?: boolean; isFinal?: boolean; isAbstract?: boolean },
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
                            checked={item.isAbstract || false}
                            onChange={(e) => onChange('isAbstract', e.target.checked)}
                            className="h-3 w-3"
                        />
                        abstract
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
        const { initialData } = this.props;
        const isFormValid = className.trim() && Object.keys(errors).length === 0;

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[90vh] border" style={{overflowY: "auto"}}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Abstract Class</h2>
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
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                        <h4 className="text-sm font-medium text-purple-800 mb-1">✨ Auto-Population Active</h4>
                        <div className="text-xs text-purple-700">
                            Pre-filled with
                            {initialData.className && <> class name <b>{initialData.className}</b>,</>}
                            {initialData.params && <> {initialData.params.length} parameter{initialData.params.length !== 1 && "s"},</>}
                            {initialData.methods && <> {initialData.methods.length} method{initialData.methods.length !== 1 && "s"},</>}
                            {initialData.constructors && <> {initialData.constructors.length} constructor{initialData.constructors.length !== 1 && "s"},</>}
                            {typeof initialData.autoGettersSetters === "boolean" && (
                                <> auto-getters/setters: <b>{initialData.autoGettersSetters ? "on" : "off"}</b></>
                            )}
                        </div>
                    </div>
                )}

                {/* Class Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Abstract Class Name *</label>
                    <input
                        type="text"
                        placeholder="Enter abstract class name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
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
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                    errors.paramName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Type"
                                value={paramDraft.type}
                                onChange={(e) => this.setState({ paramDraft: { ...paramDraft, type: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingParam ? this.handleUpdateParam : this.handleAddParam)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                    errors.paramType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={paramDraft.visibility}
                                onChange={(e) => this.setState({ paramDraft: { ...paramDraft, visibility: e.target.value as Visibility } })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline font-medium"
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
                                    editingParam === param.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
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
                                            className="text-purple-500 hover:text-purple-700 text-xs"
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
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                    errors.methodName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Return Type"
                                value={methodDraft.returnType}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, returnType: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, editingMethod ? this.handleUpdateMethod : this.handleAddMethod)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 ${
                                    errors.methodType ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <select
                                value={methodDraft.visibility}
                                onChange={(e) => this.setState({ methodDraft: { ...methodDraft, visibility: e.target.value as Visibility } })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline font-medium"
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
                                    editingMethod === method.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                                }`}>
                                    <span className="flex-1">
                                        <span className="text-gray-500">{method.visibility}</span>
                                        {method.isStatic && <span className="text-blue-600 ml-1">static</span>}
                                        {(method as any).isAbstract && <span className="text-orange-600 ml-1">abstract</span>}
                                        <span className="ml-1">{method.name}(): {method.returnType}</span>
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditMethod(method.id)}
                                            className="text-purple-500 hover:text-purple-700 text-xs"
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
                        {errors.constructorError && (
                            <p className="text-xs text-red-500">{String(errors.constructorError)}</p>
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
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                                <Abstract
                                    key={`preview-${params.length}-${methods.length}-${constructors.length}-${className}-${autoGettersSetters}`}
                                    x={10}
                                    y={10}
                                    name={className}
                                    draggable={false}
                                    params={params}
                                    constructors={constructors}
                                    methods={methods}
                                    autoGettersSetters={autoGettersSetters}
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
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Create Abstract Class
                </button>
            </div>
        );
    }
}
