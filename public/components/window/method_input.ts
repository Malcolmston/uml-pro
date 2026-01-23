import type ParamInput from "@/public/components/window/param_input";
import Visibility from "@/public/components/visibility";

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
