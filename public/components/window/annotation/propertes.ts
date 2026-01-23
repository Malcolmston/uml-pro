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

export interface CreateAnnotationState {
    annotationName: string;
    elements: AnnotationElementInput[];
    errors: Record<string, string>;
    elementDraft: Omit<AnnotationElementInput, 'id'>;
}
