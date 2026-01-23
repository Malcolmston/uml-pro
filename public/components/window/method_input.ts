import {Property} from "csstype";
import Visibility = Property.Visibility;
import type ParamInput from "@/public/components/window/param_input";

type MethodInput = {
    id: string;
    name: string;
    returnType: string;
    visibility: Visibility;
    isStatic?: boolean;
    isAbstract?: boolean;
    params?: ParamInput[];
};

export default MethodInput;
