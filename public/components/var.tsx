import Visibility from "@/public/components/visibility";

export type Var = {
    name: string;
    values?: string[];
    type?: string;
    visibility?: Visibility;
    isStatic?: boolean;
    isFinal?: boolean;
}
