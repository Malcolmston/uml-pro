import ObjectNode from "@/public/components/object/ObjectNode";
import {ClassState, Props} from "@/public/components/class/properties";
import {MethodProps} from "@/public/components/Method";
import Types from "@/public/components/objects";
import React from "react";
import Visibility from "@/public/components/visibility";

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
}
