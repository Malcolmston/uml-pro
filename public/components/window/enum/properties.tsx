import ParamInput from "@/public/components/window/param_input";
import ConstructorInput from "@/public/components/window/constructor_input";
import MethodInput from "@/public/components/window/method_input";

export type EnumConstantInput = {
    id: string;
    name: string;
    values?: string[];
};

export interface CreateEnumProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    initialData?: {
        className?: string;
        constants?: EnumConstantInput[];
        params?: ParamInput[];
        methods?: MethodInput[];
        constructors?: ConstructorInput[];
        template?: string;
    };
}

export interface CreateEnumState {
    enumName: string;
    enumConstants: EnumConstantInput[];
    params: ParamInput[];
    constructors: ConstructorInput[];
    methods: MethodInput[];
    errors: Record<string, string>;
    editingConstant: string | null;
    editingParam: string | null;
    editingMethod: string | null;
    constantDraft: Omit<EnumConstantInput, 'id'>;
    constantValues: string;
    paramDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<MethodInput, 'id'>;
}
