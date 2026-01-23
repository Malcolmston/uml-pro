import ParamInput from "@/public/components/window/param_input";
import MethodInput from "@/public/components/window/method_input";
import {BaseObjectCreatorState} from "@/public/components/window/ObjectCreator";

export interface CreateInterfaceProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    initialData?: {
        interfaceName?: string;
        constants?: Omit<ParamInput, 'id'>[];
        methods?: Omit<MethodInput, 'id'>[];
    };
}

export interface CreateInterfaceState extends BaseObjectCreatorState {
    interfaceName: string;
    constants: ParamInput[];
    methods: MethodInput[];
    constantDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<MethodInput, 'id'>;
}
