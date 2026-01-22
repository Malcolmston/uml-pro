import ObjectNode from "@/public/components/object/ObjectNode";
import {ClassState} from "@/public/components/class/properties";
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
}
