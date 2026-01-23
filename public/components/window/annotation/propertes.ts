import {BaseObjectCreatorState} from "@/public/components/window/ObjectCreator";

export type AnnotationElementInput = {
    id: string;
    name: string;
    type: string;
    defaultValue?: string;
};

export interface CreateAnnotationProps {
    onAdd: (node: React.JSX.Element) => void;
    onClose?: () => void;
    initialData?: {
        annotationName?: string;
        elements?: AnnotationElementInput[];
    };
}

export interface CreateAnnotationState extends BaseObjectCreatorState {
    annotationName: string;
    elements: AnnotationElementInput[];
    elementDraft: Omit<AnnotationElementInput, 'id'>;
    editingElement: string | null;
}
