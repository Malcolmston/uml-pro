import ParamInput from "@/public/components/window/param_input";
import ConstructorInput from "@/public/components/window/constructor_input";
import MethodInput from "@/public/components/window/method_input";
import {BaseObjectCreatorState} from "@/public/components/window/ObjectCreator";

export type AbstractMethod = {
    isAbstract?: boolean;
} & MethodInput;

export interface CreateAbstractProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    initialData?: {
        className?: string;
        params?: ParamInput[];
        methods?: AbstractMethod[];
        constructors?: ConstructorInput[];
        autoGettersSetters?: boolean;
    };
}

export interface CreateAbstractState extends BaseObjectCreatorState {
    className: string;
    params: ParamInput[];
    constructors: ConstructorInput[];
    methods: AbstractMethod[];
    editingParam: string | null;
    editingMethod: string | null;
    paramDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<AbstractMethod, 'id'>;
    autoGettersSetters: boolean;
}
