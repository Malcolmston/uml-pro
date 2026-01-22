import {ParmProps} from "@/public/components/Parameter";
import {ConstructorProps} from "@/public/components/Constructor";
import {MethodProps} from "@/public/components/Method";
import {Property} from "csstype";
import Visibility from "@/public/components/visibility";

export type Props = {
    name: string;
    x: number;
    y: number;
    params?: ParmProps[];
    // constants?: Var[];
    constructors?: ConstructorProps[];
    methods?: MethodProps[];
    autoGettersSetters?: boolean;
    gettersSettersCollapsed?: boolean;
    onDelete?: () => void;
    onInspect?: (nodeData: Record<string, unknown>) => void;
    onExport?: (code: string, fileName: string) => void;
    draggable?: boolean;

    // Add the missing getterSetterConfig type
    getterSetterConfig?: {
        [fieldName: string]: {
            hasGetter?: boolean;
            hasSetter?: boolean;
            getterVisibility?: Visibility;
            setterVisibility?: Visibility;
        }
    };
};

// Extend ObjectNode's State to include gettersSettersCollapsed
export interface ClassState {
    titleWidth: DOMRect | null;
    parmRects: (DOMRect | null)[];
    constantRects: (DOMRect | null)[];
    constructorRects: (DOMRect | null)[];
    methodRects: (DOMRect | null)[];
    contextMenu: {
        visible: boolean;
        x: number;
        y: number;
    };
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    currentPosition: { x: number; y: number };
    contextMenuOpen: boolean;
    gettersSettersCollapsed: boolean; // Add this property
}
