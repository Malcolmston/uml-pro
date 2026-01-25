import MethodInput from "@/public/components/window/method_input";
import ParamInput from "@/public/components/window/param_input";

export interface CreateRecordProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;

    // Auto-population data
    initialData?: {
        className?: string;
        params?: ParamInput[];
        methods?: MethodInput[];
        template?: string;
    };
}

export interface CreateRecordState {
    recordName: string;
    components: ParamInput[];
    methods: MethodInput[];
    errors: { [key: string]: string };

    // Editing states
    editingComponent: string | null;
    editingMethod: string | null;

    componentDraft: Omit<ParamInput, 'id'>;
    methodDraft: Omit<MethodInput, 'id'>;
}
