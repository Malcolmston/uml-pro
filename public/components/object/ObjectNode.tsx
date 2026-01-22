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
};
