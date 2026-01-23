import Visibility from "@/public/components/visibility";

type ParamInput = {
    id: string;
    name: string;
    type: string;
    visibility: Visibility;
    isStatic?: boolean;
    isFinal?: boolean;
};

export default ParamInput;
