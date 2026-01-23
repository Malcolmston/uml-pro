import ParamInput from "@/public/components/window/param_input";
import MethodInput from "@/public/components/window/method_input";

export interface CreateInterfaceProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    initialData?: {
        interfaceName?: string;
        constants?: Omit<ParamInput, 'id'>[];
        methods?: Omit<MethodInput, 'id'>[];
    };
}

export interface CreateInterfaceState {
    interfaceName: string;
    constants: ParamInput[];
    methods: MethodInput[];
    errors: Record<string, string>;
    constantDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<MethodInput, 'id'>;
}
