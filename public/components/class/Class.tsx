import ObjectNode from "@/public/components/object/ObjectNode";
import {ClassState, Props} from "@/public/components/class/properties";
import Method, {MethodProps} from "@/public/components/Method";
import Types from "@/public/components/objects";
import React from "react";
import Visibility from "@/public/components/visibility";
import {Text} from "../Svg";
import Parameter from "@/public/components/Parameter";
import Constructor from "@/public/components/Constructor";

export default class Class extends ObjectNode {
    private generatedGettersSetters: MethodProps[] = [];

    // Override state type to include gettersSettersCollapsed
    public state: ClassState;

    // Access parent's protected members (they need to be protected in ObjectNode)
    protected parmRefs: React.RefObject<SVGTextElement>[] = [];
    // protected constantRefs: React.RefObject<SVGTextElement>[] = [];
    protected conRefs: React.RefObject<SVGTextElement>[] = [];
    protected methodRefs: React.RefObject<SVGTextElement>[] = [];
    protected classType: Types = Types.CLASS;

    constructor(props: Props) {
        super(props);

        // Initialize state with gettersSettersCollapsed
        this.state = {
            ...{
                titleWidth: null,
                parmRects: [],
                //constantRects: [],
                constructorRects: [],
                methodRects: [],
                isDragging: false,
                dragOffset: { x: 0, y: 0 },
                currentPosition: { x: 0, y: 0 },
                contextMenu: { visible: false, x: 0, y: 0 },
                contextMenuOpen: false
            },  // Use super.state instead of this.state
            gettersSettersCollapsed: props.gettersSettersCollapsed ?? true
        } as unknown as ClassState;

        // Auto-generate getters and setters if enabled
        if (props.autoGettersSetters) {
            this.generateGettersAndSetters(props.getterSetterConfig || {});
        }
    }

    /**
     * Generates getter and setter methods for the class parameters based on the provided configuration.
     * Supports visibility, static modifiers, and final field checks while generating methods.
     *
     * @param {Props['getterSetterConfig']} config - Configuration object specifying behaviors for generating getters
     * and setters. Each key corresponds to a field name and allows customization of visibility, inclusion, and other
     * characteristics for the getters and setters.
     * @return {void} This method does not return a value but updates the internal method array to include the generated
     * getter and setter methods.
     */
    private generateGettersAndSetters(config: Props['getterSetterConfig'] = {}) {
        const generatedMethods: MethodProps[] = [];

        this.params.forEach(param => {
            const fieldConfig = config[param.name] || {};
            const capitalizedName = param.name.charAt(0).toUpperCase() + param.name.slice(1);

            // Generate getter (default: yes, unless explicitly disabled)
            if (fieldConfig.hasGetter !== false) {
                const getterVisibility = fieldConfig.getterVisibility ||
                    (param.visibility === Visibility.PRIVATE ? Visibility.PUBLIC : param.visibility);

                generatedMethods.push({
                    name: `get${capitalizedName}`,
                    returnType: param.type,
                    visibility: getterVisibility,
                    params: [],
                    isStatic: param.isStatic,
                    isAbstract: false
                });
            }

            // Generate setter (default: yes for non-final fields, unless explicitly disabled)
            if (fieldConfig.hasSetter !== false && !param.isFinal) {
                const setterVisibility = fieldConfig.setterVisibility ||
                    (param.visibility === Visibility.PRIVATE ? Visibility.PUBLIC : param.visibility);

                generatedMethods.push({
                    name: `set${capitalizedName}`,
                    returnType: "void",
                    visibility: setterVisibility,
                    params: [{name: "value", type: param.type}],
                    isStatic: param.isStatic,
                    isAbstract: false
                });
            }
        });

        // Store generated methods separately
        this.generatedGettersSetters = generatedMethods;

        // Add to method array for Java generation
        this.methods = [...this.methods, ...generatedMethods];
    }

    /**
     * Toggles the state of `gettersSettersCollapsed` between true and false.
     *
     * Updates the component state by inverting the current `gettersSettersCollapsed` value.
     * This method is useful for managing the expanded or collapsed state of a UI element
     * or functionality associated with getters and setters.
     */
    private toggleGettersSetters = () => {
        this.setState({
            gettersSettersCollapsed: !this.state.gettersSettersCollapsed
        } as ClassState);
    };

    private renderWithCollapsibleGettersSetters() {
        const {
            titleWidth,
            parmRects,
            //constantRects,
            constructorRects,
            methodRects,
            isDragging,
            currentPosition
        } = this.state;

        // Use current position from state instead of props for smooth dragging
        const x = currentPosition.x;
        const y = currentPosition.y;

        // Separate regular methods from generated getters/setters for display
        const regularMethods = this.methods.filter(method =>
            !this.generatedGettersSetters.some(gsMethod => gsMethod.name === method.name)
        );

        // Initialize refs arrays (only for regular methods in collapsed view)
        const displayMethods = this.state.gettersSettersCollapsed ? regularMethods : this.methods;
        this.parmRefs = this.params.map((_, i) => this.parmRefs[i] ?? React.createRef());
       // this.constantRefs = this.constants.map((_, i) => this.constantRefs[i] ?? React.createRef());
        this.conRefs = this.constructors.map((_, i) => this.conRefs[i] ?? React.createRef());
        this.methodRefs = displayMethods.map((_, i) => this.methodRefs[i] ?? React.createRef());

        // Calculate dimensions
        const maxParmWidth = parmRects.length > 0
            ? Math.max(...parmRects.map(rect => rect?.width || 0))
            : 0;


        const maxConstantWidth = 0;
            /*
            constantRects.length > 0
            ? Math.max(...constantRects.map(rect => rect?.width || 0))
            : 0;

             */

        const maxConstructorWidth = constructorRects.length > 0
            ? Math.max(...constructorRects.map(rect => rect?.width || 0))
            : 0;

        const maxMethodWidth = methodRects.length > 0
            ? Math.max(...methodRects.map(rect => rect?.width || 0))
            : 0;

        const parmHeight = parmRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);
        const constantHeight = 0; //constantRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);
        const constructorHeight = constructorRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);

        // Calculate method height - add space for collapsed getters/setters
        let methodHeight = regularMethods.length * 16; // Regular methods
        if (this.state.gettersSettersCollapsed && this.generatedGettersSetters.length > 0) {
            methodHeight += 16; // Space for "<getters and setters>" line
        } else {
            methodHeight += this.generatedGettersSetters.length * 16; // Expanded getters/setters
        }

        const width = Math.max(
            100,
            (titleWidth?.width || 0) + 20,
            maxParmWidth + 20,
            maxConstantWidth + 20,
            maxConstructorWidth + 20,
            maxMethodWidth + 20,
            200 // Minimum width for "<getters and setters>" text
        );

        const titleHeight = (titleWidth?.height || 0) + 10;
        const height = titleHeight + parmHeight + constantHeight + constructorHeight + methodHeight + 70;
        const padding = 4;

        // Y positions for sections
        const titleY = y + 15;
        const parmStartY = y + titleHeight + 15;
        const constantStartY = parmStartY + parmHeight + (this.params.length > 0 ? 15 : 5);
        const constructorStartY = constantStartY + constantHeight + 5 //(this.constants.length > 0 ? 15 : 5);
        const methodStartY = constructorStartY + constructorHeight + (this.constructors.length > 0 ? 15 : 5);

        const circleRef = React.createRef<SVGCircleElement>();

        return (
            <g
                ref={this.containerRef}
                onMouseDown={this.handleMouseDown}
                style={{
                    cursor: this.props.draggable === false ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                    userSelect: 'none'
                }}
            >
                {/* Context menu */}
                {this.state.contextMenu.visible && (
                    <foreignObject
                        x={this.state.contextMenu.x + 20}
                        y={this.state.contextMenu.y}
                        width={150}
                        height={100}
                        style={{pointerEvents: 'auto'}}
                    >
                        <div style={{
                            background: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            padding: '0.5em',
                            fontSize: '0.9em'
                        }}>
                            <div onClick={() => alert("Export Java")}>Export as .java</div>
                            <div onClick={() => alert("Delete Node")}>Delete Node</div>
                            <div onClick={() => alert("Inspect")}>Inspect</div>
                        </div>
                    </foreignObject>
                )}

                {/* Main rectangle */}
                <rect
                    width={width}
                    height={height}
                    x={x}
                    y={y}
                    rx={5}
                    ry={5}
                    fill="white"
                    stroke={isDragging ? "blue" : "black"}
                    strokeWidth={isDragging ? 2 : 1}
                />

                {/* Class type and name */}
                {this.classType !== Types.CLASS && (
                    <Text
                        x={x + width / 2}
                        y={titleY + 11}
                        text={`<<${this.classType}>>`}
                        fontSize={10}
                        fill="black"
                        textAnchor="middle"
                        fontStyle="italic"
                    />
                )}

                <Text
                    ref={this.textRef}
                    x={x + width / 2}
                    y={titleY}
                    text={this.name}
                    fontSize={15}
                    fill="black"
                    textAnchor="middle"
                    fontWeight="bold"
                />

                {/* Sections */}
                <line
                    x1={x}
                    y1={parmStartY - 10}
                    x2={x + width}
                    y2={parmStartY - 10}
                    stroke="black"
                />

                {/* Parameters */}
                {this.classType !== Types.RECORD && this.params.map((param, i) => (
                    <Parameter
                        key={`param-${i}`}
                        ref={this.parmRefs[i]}
                        x={x + padding}
                        y={parmStartY + i * 16}
                        {...param}
                        fontSize={12}
                        fill="black"
                    />
                ))}

                {this.params.length > 0 && (
                    <line
                        x1={x}
                        y1={constantStartY - 10}
                        x2={x + width}
                        y2={constantStartY - 10}
                        stroke="black"
                    />
                )}



                {/* Constructors */}
                {this.constructors.map((constructor, i) => (
                    <Constructor
                        key={`constructor-${i}`}
                        ref={this.conRefs[i]}
                        x={x + padding}  // Remove Number() conversion
                        y={constructorStartY + i * 16}  // Remove Number() conversion
                        {...constructor}
                        fontSize={12}
                        fill="black"
                    />
                ))}

                {this.constructors.length > 0 && (
                    <line
                        x1={x}
                        y1={methodStartY - 10}
                        x2={x + width}
                        y2={methodStartY - 10}
                        stroke="black"
                    />
                )}

                {/* Methods section with collapsible getters/setters */}
                {regularMethods.map((method, i) => (
                    <Method
                        key={`method-${i}`}
                        ref={this.methodRefs[i]}

                        {...method}

                        x={x + padding}
                        y={methodStartY + i * 16}

                        fontSize={12}
                        fill="black"
                    />
                ))}

                {/* Collapsible getters and setters */}
                {this.generatedGettersSetters.length > 0 && (
                    <>
                        {this.state.gettersSettersCollapsed ? (
                            <Text
                                x={x + padding}
                                y={methodStartY + regularMethods.length * 16}
                                fontSize={12}
                                fill="gray"
                                style={{cursor: "pointer"}}
                                onClick={this.toggleGettersSetters}
                            >
                                <tspan>&lt;getters and setters&gt;</tspan>
                            </Text>
                        ) : (
                            <>
                                <Text
                                    x={x + padding}
                                    y={methodStartY + regularMethods.length * 16}
                                    fontSize={12}
                                    fill="gray"
                                    style={{cursor: "pointer"}}
                                    onClick={this.toggleGettersSetters}
                                >
                                    <tspan>[-] getters and setters</tspan>
                                </Text>
                                {this.generatedGettersSetters.map((method, i) => (
                                    <Method
                                        key={`getter-setter-${i}`}
                                        {...method}
                                        x={x + padding + 10}  // Remove Number() conversion
                                        y={methodStartY + (regularMethods.length + 1 + i) * 16}  // Remove Number() conversion
                                        fontSize={11}
                                        fill="gray"
                                    />
                                ))}
                            </>
                        )}
                    </>
                )}

                {/* Debug circle */}
                <circle
                    ref={circleRef}
                    r={3}
                    cx={x + width - 5}
                    cy={y + 5}
                    fill="red"
                    onContextMenu={(e) => {
                        /*
                        this.handleContextMenu(e);
                        this.setState({contextMenuOpen: true});

                         */
                    }}
                    onMouseLeave={() => {
                        this.setState({contextMenuOpen: false});
                    }}
                />


            </g>
        );
    }

    // Override the render method to handle collapsible getters/setters
    render() {
        // Get the base render
        const baseRender = super.render();

        // If no auto-generated getters/setters, return base render
        if (!this.props.autoGettersSetters || this.generatedGettersSetters.length === 0) {
            return baseRender;
        }

        // We need to modify the methods section to show collapsible getters/setters
        return this.renderWithCollapsibleGettersSetters();
    }
}
