import ParamInput from "@/public/components/window/param_input";
import MethodInput from "@/public/components/window/method_input";
import ConstructorInput from "@/public/components/window/constructor_input";

export interface CreateClassProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    onDelete?: () => void;
    onInspect?: (nodeData: Record<string, unknown>) => void;
    onExport?: (code: string, fileName: string) => void;

    // Add the missing initialData prop
    initialData?: {
        className?: string;
        params?: ParamInput[];
        methods?: MethodInput[];
        constructors?: ConstructorInput[];
        autoGettersSetters?: boolean;
    };
}

export  interface CreateClassState {
    className: string;
    params: ParamInput[];
    constructors: ConstructorInput[];
    methods: MethodInput[];
    errors: Record<string, string>;
    editingParam: string | null;
    editingMethod: string | null;
    paramDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<MethodInput, 'id'>;
    autoGettersSetters: boolean;
}
