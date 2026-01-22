import ObjectNode from "@/public/components/object/ObjectNode";
import {ClassState, Props} from "@/public/components/class/properties";
import {MethodProps} from "@/public/components/Method";
import Types from "@/public/components/objects";
import React from "react";

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
}
