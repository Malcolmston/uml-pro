import {Circle, Line, Rect, Text} from "../Svg";
import React, {Component, createRef} from "react";
import Parameter, {type ParmProps} from "../addons/Parameter";
import Method, {type MethodProps} from "../addons/Method";
import Constructor, {type ConstructorProps} from "../addons/Constructor";
import Constant, {type Var} from "../addons/Constant";
import {Types, type UML} from "../addons/Modifiers";
import {getVisibility} from "../visibility";
import type {Props, State} from "@/public/components/object/properties";



export default abstract class ObjectNode extends Component<Props, State> implements UML {
    protected textRef = createRef<SVGTextElement>();
    public containerRef = createRef<SVGGElement>(); // Made public for connector access

    protected classType: Types;

    protected parmRefs: React.RefObject<SVGTextElement>[] = [];
    //protected constantRefs: React.RefObject<SVGTextElement>[] = [];
    protected conRefs: React.RefObject<SVGTextElement>[] = [];
    protected methodRefs: React.RefObject<SVGTextElement>[] = [];

    protected params: ParmProps[];
    protected constants: Var[];
    protected constructors: ConstructorProps[];
    protected methods: MethodProps[];

    protected name: string;


    public state: State = {
        titleWidth: null,
        parmRects: [],
        // constantRects: [],
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
    protected constructor(props: Props): void {
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
};
