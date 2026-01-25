import {CreateAnnotationProps, CreateAnnotationState} from "@/public/components/window/annotation/propertes";
import React from "react";
import ObjectCreator from "@/public/components/window/ObjectCreator";
import Annotation from "@/public/components/annotation/Annotation";

export default class CreateAnnotation extends ObjectCreator<CreateAnnotationProps, CreateAnnotationState> {
    commonTypes: string[];

    constructor(props: CreateAnnotationProps) {
        super(props);
        const baseState: CreateAnnotationState = {
            annotationName: "",
            elements: [],
            errors: {},
            elementDraft: {
                name: "",
                type: "",
                defaultValue: ""
            },
            editingElement: null
        };
        this.state = {
            ...baseState,
            ...this.seedInitialState(props.initialData)
        };
        this.commonTypes = [
            "String", "int", "boolean", "Class<?>", "String[]", "int[]",
            "Class<?>[]", "ElementType", "RetentionPolicy"
        ];
    }

    private seedInitialState(initialData?: CreateAnnotationProps['initialData']) {
        if (!initialData) return {};
        const seeded: Partial<CreateAnnotationState> = {};

        if (initialData.annotationName) {
            seeded.annotationName = initialData.annotationName;
        }
        if (initialData.elements) {
            seeded.elements = initialData.elements.map(element => ({
                ...element,
                id: element.id || this.generateId()
            }));
        }

        return seeded;
    }

    componentDidUpdate(prevProps: CreateAnnotationProps) {
        // Auto-populate if initialData changes after mount
        if (
            this.props.initialData &&
            this.props.initialData !== prevProps.initialData
        ) {
            const seeded = this.seedInitialState(this.props.initialData);
            if (Object.keys(seeded).length > 0) {
                this.setState(seeded as Pick<CreateAnnotationState, keyof CreateAnnotationState>);
            }
        }
    }


    handleAddElement = () => {
        const { elementDraft, elements } = this.state;
        const isNameValid = this.validateInput('elementName', elementDraft.name, 'element');
        const isTypeValid = this.validateInput('elementType', elementDraft.type, 'element');

        if (isNameValid && isTypeValid) {
            const isDuplicate = elements.some(e => e.name === elementDraft.name.trim());
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, elementName: 'Element name already exists' }
                }));
                return;
            }

            this.setState(prev => ({
                elements: [
                    ...prev.elements,
                    {
                        ...elementDraft,
                        id: this.generateId(),
                        name: elementDraft.name.trim(),
                        type: elementDraft.type.trim(),
                        defaultValue: elementDraft.defaultValue?.trim() || undefined
                    }
                ],
                elementDraft: { name: "", type: "", defaultValue: "" },
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.elementName;
                    delete newErrors.elementType;
                    return newErrors;
                })()
            }));
        }
    };

    handleEditElement = (id: string) => {
        const element = this.state.elements.find(e => e.id === id);
        if (element) {
            this.setState({
                elementDraft: {
                    name: element.name,
                    type: element.type,
                    defaultValue: element.defaultValue || ""
                },
                editingElement: id
            });
        }
    };

    handleUpdateElement = () => {
        const { elementDraft, elements, editingElement } = this.state;
        if (!editingElement) return;

        const isNameValid = this.validateInput('elementName', elementDraft.name, 'element');
        const isTypeValid = this.validateInput('elementType', elementDraft.type, 'element');
        if (isNameValid && isTypeValid) {
            const isDuplicate = elements.some(e => e.name === elementDraft.name.trim() && e.id !== editingElement);
            if (isDuplicate) {
                this.setState(prev => ({
                    errors: { ...prev.errors, elementName: 'Element name already exists' }
                }));
                return;
            }

            this.setState(prev => ({
                elements: prev.elements.map(e =>
                    e.id === editingElement
                        ? {
                            ...e,
                            name: elementDraft.name.trim(),
                            type: elementDraft.type.trim(),
                            defaultValue: elementDraft.defaultValue?.trim() || undefined
                        }
                        : e
                ),
                elementDraft: { name: "", type: "", defaultValue: "" },
                editingElement: null,
                errors: (() => {
                    const newErrors = { ...prev.errors };
                    delete newErrors.elementName;
                    delete newErrors.elementType;
                    return newErrors;
                })()
            }));
        }
    };

    handleCancelEditElement = () => {
        this.setState(prev => ({
            elementDraft: { name: "", type: "", defaultValue: "" },
            editingElement: null,
            errors: (() => {
                const newErrors = { ...prev.errors };
                delete newErrors.elementName;
                delete newErrors.elementType;
                return newErrors;
            })()
        }));
    };

    handleRemoveElement = (id: string) => {
        this.setState(prev => ({
            elements: prev.elements.filter(e => e.id !== id)
        }), () => {
            if (this.state.editingElement === id) {
                this.handleCancelEditElement();
            }
        });
    };

    handleAddAnnotation = () => {
        const { annotationName, elements } = this.state;
        const isAnnotationNameValid = this.validateInput('annotationName', annotationName, 'annotation');
        if (!isAnnotationNameValid) return;

        const finalAnnotationName = annotationName.trim() || `Annotation${this.idRef.current}`;
        const id = `annotation-${this.idRef.current++}`;

        const newAnnotation = (
            <Annotation
                key={id}
                name={finalAnnotationName}
                x={100}
                y={100}
                draggable={true}
                elements={elements}
            />
        );

        this.props.onAdd(newAnnotation);

        // Reset form
        this.setState({
            annotationName: "",
            elements: [],
            errors: {},
            elementDraft: { name: "", type: "", defaultValue: "" },
            editingElement: null
        });

        this.props.onClose?.();
    };


    render() {
        const { annotationName, elements, errors, elementDraft, editingElement } = this.state;
        const isFormValid = annotationName.trim() && Object.keys(errors).length === 0;

        return (
            <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[90vh] border" style={{overflowY: "auto"}}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Create New Annotation</h2>
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

                {/* Annotation Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Annotation Name *</label>
                    <input
                        type="text"
                        placeholder="Enter annotation name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                            errors.annotationName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={annotationName}
                        onChange={(e) => {
                            this.setState({ annotationName: e.target.value });
                            if (errors.annotationName) {
                                this.validateInput('annotationName', e.target.value, 'annotation');
                            }
                        }}
                        onBlur={() => this.validateInput('annotationName', annotationName, 'annotation')}
                        onKeyPress={(e) => this.handleKeyPress(e, this.handleAddAnnotation)}
                    />
                    {errors.annotationName && (
                        <p className="text-xs text-red-500">{errors.annotationName}</p>
                    )}
                    <p className="text-xs text-gray-500">
                        Annotation names typically start with capital letter (e.g., @Override, @Entity)
                    </p>
                </div>

                {/* Annotation Elements Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Annotation Elements (Optional)</h3>
                    <p className="text-xs text-gray-500">
                        Elements define the parameters that can be passed to the annotation
                    </p>
                    {/* Add Element Form */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Element Name"
                                value={elementDraft.name}
                                onChange={(e) => this.setState({ elementDraft: { ...elementDraft, name: e.target.value } })}
                                onKeyPress={(e) => this.handleKeyPress(e, this.handleAddElement)}
                                className={`px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 ${
                                    errors.elementName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type"
                                    value={elementDraft.type}
                                    onChange={(e) => this.setState({ elementDraft: { ...elementDraft, type: e.target.value } })}
                                    onKeyPress={(e) => this.handleKeyPress(e, this.handleAddElement)}
                                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 ${
                                        errors.elementType ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    list="common-types"
                                />
                                <datalist id="common-types">
                                    {this.commonTypes.map(type => (
                                        <option key={type} value={type} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Default Value (optional)"
                            value={elementDraft.defaultValue}
                            onChange={(e) => this.setState({ elementDraft: { ...elementDraft, defaultValue: e.target.value } })}
                            onKeyPress={(e) => this.handleKeyPress(e, this.handleAddElement)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                        {(errors.elementName || errors.elementType) && (
                            <p className="text-xs text-red-500">
                                {errors.elementName || errors.elementType}
                            </p>
                        )}
                        <div className="flex gap-2">
                            {editingElement ? (
                                <>
                                    <button
                                        onClick={this.handleUpdateElement}
                                        className="text-sm text-green-600 hover:text-green-800 hover:underline font-medium"
                                    >
                                        ✓ Update Element
                                    </button>
                                    <button
                                        onClick={this.handleCancelEditElement}
                                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
                                    >
                                        ✗ Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={this.handleAddElement}
                                    className="text-sm text-pink-600 hover:text-pink-800 hover:underline font-medium"
                                >
                                    + Add Element
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Elements List */}
                    {elements.length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {elements.map((element) => (
                                <div key={element.id} className={`flex items-center justify-between px-2 py-1 rounded text-sm ${
                                    editingElement === element.id ? 'bg-pink-100 border border-pink-200' : 'bg-pink-50'
                                }`}>
                                    <span>
                                        <span className="text-pink-700 font-medium">{element.type} {element.name}()</span>
                                        {element.defaultValue && (
                                            <span className="text-gray-600"> default {element.defaultValue}</span>
                                        )}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => this.handleEditElement(element.id)}
                                            className="text-pink-500 hover:text-pink-700 text-xs"
                                            aria-label="Edit element"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            onClick={() => this.handleRemoveElement(element.id)}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Remove element"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Common Annotation Patterns */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Quick Templates</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => {
                                this.setState({
                                    elements: [
                                        { id: this.generateId(), name: "value", type: "String", defaultValue: '""' }
                                    ]
                                });
                            }}
                            className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded text-sm"
                        >
                            Simple Value
                        </button>
                        <button
                            onClick={() => {
                                this.setState({
                                    elements: [
                                        { id: this.generateId(), name: "value", type: "String[]", defaultValue: "{}" },
                                        { id: this.generateId(), name: "required", type: "boolean", defaultValue: "true" }
                                    ]
                                });
                            }}
                            className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded text-sm"
                        >
                            Validation
                        </button>
                        <button
                            onClick={() => {
                                this.setState({
                                    elements: [
                                        { id: this.generateId(), name: "name", type: "String", defaultValue: '""' },
                                        { id: this.generateId(), name: "table", type: "String", defaultValue: '""' }
                                    ]
                                });
                            }}
                            className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded text-sm"
                        >
                            Entity Mapping
                        </button>
                        <button
                            onClick={() => {
                                this.setState({
                                    elements: [
                                        { id: this.generateId(), name: "value", type: "Class<?>[]", defaultValue: "{}" }
                                    ]
                                });
                            }}
                            className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded text-sm"
                        >
                            Configuration
                        </button>
                    </div>
                </div>

                {/* Meta-Annotations Info */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-pink-800 mb-2">Common Meta-Annotations</h4>
                    <div className="text-xs text-pink-700 space-y-1">
                        <div>• <strong>@Target:</strong> Specifies where annotation can be used</div>
                        <div>• <strong>@Retention:</strong> Defines how long annotation is retained</div>
                        <div>• <strong>@Documented:</strong> Includes annotation in documentation</div>
                        <div>• <strong>@Inherited:</strong> Allows subclasses to inherit annotation</div>
                    </div>
                </div>

                {/* Usage Examples */}
                {elements.length > 0 && (
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-pink-800 mb-2">Usage Examples</h4>
                        <div className="text-xs text-pink-700 space-y-1">
                            <div>• <code>@{annotationName || 'MyAnnotation'}</code> (no parameters)</div>
                            {elements.length === 1 && elements[0].name === 'value' && (
                                <div>• <code>@{annotationName || 'MyAnnotation'}(&quot;someValue&quot;)</code> (single value)</div>
                            )}
                            <div>• <code>@{annotationName || 'MyAnnotation'}({elements.map(e => `${e.name}=${e.defaultValue || `&quot;value&quot;`}`).join(', ')})</code></div>
                        </div>
                    </div>
                )}

                {/* Annotation Guidelines */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-pink-800 mb-2">Annotation Guidelines</h4>
                    <ul className="text-xs text-pink-700 space-y-1">
                        <li>• Annotation elements are abstract methods with no parameters</li>
                        <li>• Element types must be primitives, String, Class, enum, annotation, or arrays of these</li>
                        <li>• Default values are optional but recommended</li>
                        <li>• Use &quot;value&quot; as element name for single-parameter annotations</li>
                        <li>• Consider adding meta-annotations like @Target and @Retention</li>
                    </ul>
                </div>

                {/* Preview */}
                {annotationName && (
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                        <div className="bg-white rounded border" style={{ minHeight: '150px' }}>
                            <svg width="100%" height="200" viewBox="0 0 280 200">
                                <Annotation
                                    key={`preview-${elements.length}-${annotationName}`}
                                    x={10}
                                    y={10}
                                    name={annotationName}
                                    draggable={false}
                                    elements={elements}
                                />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Create Button */}
                <button
                    onClick={this.handleAddAnnotation}
                    disabled={!isFormValid}
                    className={`w-full px-4 py-3 rounded-md font-medium transition-colors ${
                        isFormValid
                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    Create Annotation
                </button>
            </div>
        );
    }
}
