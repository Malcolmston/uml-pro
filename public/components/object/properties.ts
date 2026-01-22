import {AtRule} from "csstype";
import Types = AtRule.Types;
import {ParmProps} from "@/public/components/Parameter";
import {ConstructorProps} from "@/public/components/Constructor";
import {MethodProps} from "@/public/components/Method";

export type Props = {
    name: string;
    type?: Types;
    x: number;
    y: number;

    params?: ParmProps[];
    //constants?: Var[];
    constructors?: ConstructorProps[];
    methods?: MethodProps[];

    autoGettersSetters?: boolean;

    // Callback for when position changes
    onPositionChange?: (x: number, y: number) => void;

    // Callback for when node should be deleted
    onDelete?: () => void;

    // Callback for inspect action
    onInspect?: (nodeData: Record<string, unknown>) => void;

    // Callback for download/export action
    onExport?: (code: string, fileName: string) => void;

    // Optional: disable dragging
    draggable?: boolean;
};

export type State = {
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

    // Drag state
    isDragging: boolean;
    dragOffset: { x: number; y: number };
    currentPosition: { x: number; y: number };

    contextMenuOpen: boolean;
};
