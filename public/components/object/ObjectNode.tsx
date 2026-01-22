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

};
