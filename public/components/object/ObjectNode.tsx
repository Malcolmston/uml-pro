import {Circle, Line, Rect, Text} from "../Svg";
import React, {Component, createRef} from "react";
import Parameter, {type ParmProps} from "../Parameter";
import Method, {type MethodProps} from "../Method"
import Constructor, {type ConstructorProps} from "../Constructor";
//import Constant, {type Var} from "../addons/Constant";
import type UML from "./uml";
import Types from "../objects"
import {getVisibility} from "../visibility";
import {type Props, type State} from "@/public/components/object/properties";


/**
 * Abstract class representing a node object in an UML diagram.
 * This class extends React.Component and provides drag-and-drop functionality, event handling,
 * and state management for diagram elements.
 * Use it as a base class for implementing specific types of UML diagram nodes.
 */
export default abstract class ObjectNode extends Component<Props, State> implements UML {
    protected textRef = createRef<SVGTextElement>();
    public containerRef = createRef<SVGGElement>(); // Made public for connector access

    protected classType: Types;

    protected parmRefs: React.RefObject<SVGTextElement>[] = [];
    protected constantRefs: React.RefObject<SVGTextElement>[] = [];
    protected conRefs: React.RefObject<SVGTextElement>[] = [];
    protected methodRefs: React.RefObject<SVGTextElement>[] = [];

    protected params: ParmProps[];
   // protected constants: Var[];
    protected constructors: ConstructorProps[];
    protected methods: MethodProps[];

    protected name: string;


    public state: State = {
        titleWidth: null,
        parmRects: [],
        constantRects: [],
        constructorRects: [],
        methodRects: [],
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
        contextMenu: { visible: false, x: 0, y: 0 },
        contextMenuOpen: false
    };

    /**
     * Protected constructor for initializing an instance with given properties.
     *
     * @param {Props} props - The properties used to initialize the instance.
     * @param {Array} props.params - An array of parameters, defaults to an empty array if not provided.
     * @param {Array} props.constructors - An array of constructors, defaults to an empty array if not provided.
     * @param {Array} props.methods - An array of methods, defaults to an empty array if not provided.
     * @param {string} props.name - The name associated with the instance.
     * @param {string} props.type - The type of the class, defaults to `Types.CLASS`.
     * @param {number} props.x - The x-position for the current state.
     * @param {number} props.y - The y-position for the current state.
     *
     * @return {void}
     */
    protected constructor(props: Props) {
        super(props);

        this.params = props.params || [];
        //this.constants = props.constants || [];
        this.constructors = props.constructors || [];
        this.methods = props.methods || [];

        this.name = this.props.name;

        this.classType = this.props.type || Types.CLASS;

        this.state.currentPosition = { x: props.x, y: props.y };
    }

    /**
     * Sets the class type.
     *
     * @param {Types} type - The type to set for the class.
     */
    protected set setType(type: Types) {
        this.classType = type;
    }

    /**
     * Lifecycle method invoked immediately after the component is mounted.
     * Initializes necessary event listeners and performs operations required after the component is added to the DOM.
     *
     * @return {void} This method does not return a value.
     */
    componentDidMount() {
        this.updateWidths();

        // Add global event listeners for drag operations
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        document.addEventListener('mouseleave', this.handleMouseUp); // Stop dragging if mouse leaves document
    }

    /**
     * Lifecycle method invoked immediately before a component is unmounted and destroyed.
     * This method is used to perform cleanup activities such as removing event listeners or canceling network requests.
     *
     * @return {void} This method does not return a value.
     */
    componentWillUnmount() {
        // Clean up event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        document.removeEventListener('mouseleave', this.handleMouseUp);
    }

    /**
     * Lifecycle method called after the component updates.
     * This method checks for changes in specific props and updates the component's state or calls other methods accordingly.
     *
     * @param {Props} prevProps - The props that were passed to the component before the update.
     * @return {void} This method does not return any value.
     */
    componentDidUpdate(prevProps: Props) {
        if (prevProps.name !== this.props.name ||
            // prevProps.constants !== this.props.constants ||
            prevProps.params !== this.props.params ||
            prevProps.constructors !== this.props.constructors ||
            prevProps.methods !== this.props.methods) {
            this.updateWidths();
        }

        // Update position if props changed
        if (prevProps.x !== this.props.x || prevProps.y !== this.props.y) {
            this.setState({
                currentPosition: { x: this.props.x, y: this.props.y }
            });
        }
    }

    /**
     * Updates the widths of various elements by retrieving their bounding box dimensions
     * and updates the component's state with the collected dimensions.
     *
     * @return {void} Does not return a value. Updates the component's state with
     *                the calculated dimensions for title, parameters, constructors, and methods.
     */
    updateWidths() {
        const titleWidth = this.textRef.current?.getBBox() || null;

        const parmRects = this.parmRefs.map(ref => {
            return ref.current?.getBBox() || null;
        });

        const constantRects = this.constantRefs.map(ref => {
            return ref.current?.getBBox() || null;
        });

        const constructorRects = this.conRefs.map(ref => {
            return ref.current?.getBBox() || null;
        });

        const methodRects = this.methodRefs.map(ref => {
            return ref.current?.getBBox() || null;
        });

        this.setState({ titleWidth, parmRects, constantRects, constructorRects, methodRects });
    }

    // Drag and drop event handlers
    /**
     * Handles the `mousedown` event on an SVG element.
     *
     * This function is triggered when a user presses the mouse button over an SVG element.
     * It calculates the mouse position relative to the SVG coordinate space and determines
     * the drag offset. The component state is updated to enable dragging behavior.
     *
     * Behavior:
     * - If the `draggable` prop is set to `false`, the function exits early without any action.
     * - Prevents the default browser behavior and stops event propagation.
     * - Computes the offset between the mouse position and the current position of the node.
     * - Updates the component state to mark the start of a dragging operation and records the drag offset.
     *
     * @param {React.MouseEvent<SVGGElement>} event - The `mousedown` event object triggered by the user interaction.
     */
    handleMouseDown = (event: React.MouseEvent<SVGGElement>) => {
        if (this.props.draggable === false) return;

        event.preventDefault();
        event.stopPropagation();

        // Get the SVG element to calculate proper coordinates
        const svg = event.currentTarget.ownerSVGElement;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const svgX = event.clientX - rect.left;
        const svgY = event.clientY - rect.top;

        // Calculate offset from mouse position to node position
        const dragOffset = {
            x: svgX - this.state.currentPosition.x,
            y: svgY - this.state.currentPosition.y
        };

        this.setState({
            isDragging: true,
            dragOffset
        });
    };

    /**
     * Handles the mouse movement event during a drag operation.
     * Updates the position of an object within an SVG element based on the current mouse coordinates.
     *
     * @param {MouseEvent} event The mouse event containing the current cursor position.
     */
    handleMouseMove = (event: MouseEvent) => {
        if (!this.state.isDragging) return;

        // Find the SVG element
        const svg = this.containerRef.current?.ownerSVGElement;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const svgX = event.clientX - rect.left;
        const svgY = event.clientY - rect.top;

        // Calculate new position
        const newPosition = {
            x: svgX - this.state.dragOffset.x,
            y: svgY - this.state.dragOffset.y
        };

        // Ensure the node doesn't go off-screen (optional bounds checking)
        const boundedPosition = {
            x: newPosition.x,
            y:  newPosition.y
        };

        this.setState({
            currentPosition: boundedPosition
        });
    };

    /**
     * Handles the mouse up event during a drag operation.
     *
     * This function is responsible for stopping the drag operation and resetting
     * the `isDragging` state. If a position change occurred during the drag, it
     * will notify the parent component by invoking the `onPositionChange` callback
     * with the current position coordinates.
     *
     * State Changes:
     * - Sets `isDragging` to `false` to indicate that the drag operation has ended.
     *
     * Callbacks:
     * - Invokes `onPositionChange` if it is provided as a prop, passing the current
     *   `x` and `y` coordinates of the position.
     */
    handleMouseUp = () => {
        if (!this.state.isDragging) return;

        this.setState({
            isDragging: false
        });

        // Notify parent component of position change
        if (this.props.onPositionChange) {
            this.props.onPositionChange(
                this.state.currentPosition.x,
                this.state.currentPosition.y
            );
        }
    };

    render() {
        const { titleWidth, parmRects, constantRects, constructorRects, methodRects, isDragging, currentPosition, contextMenuOpen } = this.state;

        // Use current position from state instead of props for smooth dragging
        const x = currentPosition.x;
        const y = currentPosition.y;

        // Initialize refs arrays
        this.parmRefs = this.params.map((_, i) => this.parmRefs[i] ?? createRef());
       // this.constantRefs = this.constants.map((_, i) => this.constantRefs[i] ?? createRef());
        this.conRefs = this.constructors.map((_, i) => this.conRefs[i] ?? createRef());
        this.methodRefs = this.methods.map((_, i) => this.methodRefs[i] ?? createRef());

        // Calculate dimensions
        const maxParmWidth = parmRects.length > 0
            ? Math.max(...parmRects.map(rect => rect?.width || 0))
            : 0;

        const maxConstantWidth = constantRects.length > 0
            ? Math.max(...constantRects.map(rect => rect?.width || 0))
            : 0;

        const maxConstructorWidth = constructorRects.length > 0
            ? Math.max(...constructorRects.map(rect => rect?.width || 0))
            : 0;

        const maxMethodWidth = methodRects.length > 0
            ? Math.max(...methodRects.map(rect => rect?.width || 0))
            : 0;

        const parmHeight = parmRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);
        const constantHeight = constantRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);
        const constructorHeight = constructorRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);
        const methodHeight = methodRects.reduce((acc, rect) => acc + (rect?.height || 0), 0);

        const width = Math.max(
            100,
            (titleWidth?.width || 0) + 20,
            maxParmWidth + 20,
            maxConstantWidth + 20,
            maxConstructorWidth + 20,
            maxMethodWidth + 20
        );

        const titleHeight = (titleWidth?.height || 0) + 10;
        const totalParmHeight = parmHeight + (this.params.length > 0 ? 20 : 0);
        const totalConstantHeight = constantHeight + (this.constantRefs.length > 0 ? 20 : 0);
        const totalConstructorHeight = constructorHeight + (this.constructors.length > 0 ? 20 : 0);
        const totalMethodHeight = methodHeight + (this.methods.length > 0 ? 20 : 0);

        const height = titleHeight + totalParmHeight + totalConstantHeight + totalConstructorHeight + totalMethodHeight + 20;
        const padding = 4;

        // Y positions for sections
        const titleY = y + 15;
        const parmStartY = y + titleHeight + 15;
        const constantStartY = parmStartY + parmHeight + (this.params.length > 0 ? 15 : 5);
        const constructorStartY = constantStartY + constantHeight + 5;
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

                {this.state.contextMenu.visible && (
                    <foreignObject
                        x={this.state.contextMenu.x + 20 + "px"}
                        y={this.state.contextMenu.y}
                        width={200}
                        height={120}
                        style={{ pointerEvents: 'auto' }}
                    >

                    </foreignObject>
                )}

                {/* Main rectangle */}
                <Rect
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

                {/* Class type (if not a regular class) */}
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

                {/* Class name */}
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

                {/* Line after class name */}
                <Line
                    x1={x}
                    y1={parmStartY - 10}
                    x2={x + width}
                    y2={parmStartY - 10}
                    stroke="black"
                />

                {/* Parameters section */}
                {this.classType != Types.RECORD && this.params.map((param, i) => (
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

                {/* Line after parameters (only if there are parameters) */}
                { this.params.length > 0 && (
                    <Line
                        x1={x}
                        y1={constantStartY - 10}
                        x2={x + width}
                        y2={constantStartY - 10}
                        stroke="black"
                    />
                )}

                {/* Constructors section */}
                {this.constructors.map((constructor, i) => (
                    <Constructor
                        key={`constructor-${i}`}
                        ref={this.conRefs[i]}
                        x={x + padding}
                        y={constructorStartY + i * 16}
                        {...constructor}
                        fontSize={12}
                        fill="black"
                    />
                ))}

                {/* Line after constructors (only if there are constructors) */}
                {this.constructors.length > 0 && (
                    <Line
                        x1={x}
                        y1={methodStartY - 10}
                        x2={x + width}
                        y2={methodStartY - 10}
                        stroke="black"
                    />
                )}

                {/* Methods section */}
                {this.methods.map((method, i) => (
                    <Method
                        key={`method-${i}`}
                        ref={this.methodRefs[i]}
                        {...method}
                        x={ (x + padding) as number}
                        y={ (methodStartY + i * 16) as number}

                        fontSize={12}
                        fill="black"
                    />
                ))}

                {/* Debug circle (optional - remove if not needed) */}
                <Circle
                    ref={circleRef}
                    r={3}
                    cx={x + width - 5}
                    cy={y + 5}
                    fill="red"
                    onContextMenu={(e) => {
                        /*
                        this.handleContextMenu(e);
                        this.setState({ contextMenuOpen: true });

                         */
                    }}
                    onMouseLeave={() => {
                        this.setState({ contextMenuOpen: false });
                    }}
                />


            </g>
        );
    }

};
