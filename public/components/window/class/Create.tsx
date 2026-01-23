import React from "react";
import {CreateClassProps, CreateClassState} from "@/public/components/window/class/properties";
import Visibility from "@/public/components/visibility";

export default class CreateClass extends React.Component<CreateClassProps, CreateClassState> {
    idRef: { current: number };


    constructor(props: CreateClassProps) {
        super(props);
        this.idRef = { current: 0 };
        this.state = {
            className: "",
            params: [],
            constructors: [],
            methods: [],
            errors: {},
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
                isStatic: false
            },
            autoGettersSetters: false
        };
    }
}
