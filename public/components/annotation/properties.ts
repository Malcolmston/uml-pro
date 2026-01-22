import {MethodProps} from "@/public/components/Method";

export type AnnotationElement = {
    id?: string;
    name: string;
    type: string;
    defaultValue?: string;
};

export type Props = {
    name: string;
    x: number;
    y: number;
    elements?: Array<{
        name: string;
        type: string;
        defaultValue?: string;
    }>;
    params?: MethodProps[];
    methods?: MethodProps[];
    constructors?: unknown[];
    constants?: unknown[];
    onPositionChange?: (x: number, y: number) => void;
    onDelete?: () => void;
    onInspect?: (nodeData: Record<string, unknown>) => void;
    onExport?: (code: string, fileName: string) => void;
};
