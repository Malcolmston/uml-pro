// Extend Var with the required SVG text props
import {SVGProps} from "react";
import {Var} from "@/public/components/var";

export type ConstantProps = Var & {
    x: number;
    y: number;
    fontSize?: number;
    fill?: string;
} & Omit<SVGProps<SVGTextElement>, 'values'>;
