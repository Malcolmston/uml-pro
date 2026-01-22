import {ParmProps} from "@/public/components/Parameter";
import {Var} from "@/public/components/var";
import {ConstructorProps} from "@/public/components/Constructor";
import {MethodProps} from "@/public/components/Method";

type Props = {
    name: string;
    x: number;
    y: number;

    params?: ParmProps[];
    constants?: Var[];
    constructors?: ConstructorProps[];
    methods?: MethodProps[];
};

export default Props;
