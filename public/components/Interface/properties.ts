import {ParmProps} from "@/public/components/Parameter";
import {ConstructorProps} from "@/public/components/Constructor";
import {MethodProps} from "@/public/components/Method";

type Props = {
    name: string;
    x: number;
    y: number;

    params?: ParmProps[];
    constructors?: ConstructorProps[];
    methods?: MethodProps[];
};

export default Props;
