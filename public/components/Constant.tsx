// Extend Var with the required SVG text props
import React, {forwardRef, SVGProps} from "react";
import {Var} from "@/public/components/var";
import {Text} from "./Svg";

export type ConstantProps = Var & {
    x: number;
    y: number;
    fontSize?: number;
    fill?: string;
} & Omit<SVGProps<SVGTextElement>, 'values'>;

/**
 * A React component that renders an SVG text element, displaying a constant
 * and optionally its associated values. The component supports customization
 * of its position, font size, and fill color.
 *
 * @constant
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<ConstantProps> & React.RefAttributes<SVGTextElement>>}
 *
 * @param {Object} props                  The properties passed to the component.
 * @param {string} props.name             The name of the constant to be displayed.
 * @param {Array<string | number>} props.values Optional array of values associated with the constant.
 *                                              Displayed within parentheses if provided.
 * @param {number} props.x                The x-coordinate position of the text element.
 * @param {number} props.y                The y-coordinate position of the text element.
 * @param {string | number} props.fontSize The font size of the text element.
 * @param {string} props.fill             The fill color for the text element.
 * @param {Object} props.props            Additional properties to be spread onto the `Text` component.
 * @param {React.Ref<SVGTextElement>} ref A ref that is forwarded to the underlying `Text` element.
 *
 * @returns {React.Element} A rendered SVG `<Text>` element displaying the constant and its values.
 */
const Constant: React.ForwardRefExoticComponent<React.PropsWithoutRef<ConstantProps> & React.RefAttributes<SVGTextElement>> = forwardRef<SVGTextElement, ConstantProps>(function Constant({
                                                                                 name,
                                                                                 values,
                                                                                 x,
                                                                                 y,
                                                                                 fontSize,
                                                                                 fill,
                                                                                 isStatic,
                                                                                 isFinal,
                                                                                 type,
                                                                                 visibility,
                                                                                 ...props
                                                                             }, ref) {
    if (values?.length && values.length >= 1) {
        return (
            <Text
                ref={ref}
                x={x}
                y={y}
                fontSize={fontSize}
                fill={fill}
                {...props}
            >
                <tspan>{name}(</tspan>
                <tspan>{values?.toString().replace(/[[\]()]/g, "")}</tspan>
                <tspan>)</tspan>
            </Text>
        );
    } else {
        return (
            <Text
                ref={ref}
                x={x}
                y={y}
                fontSize={fontSize}
                fill={fill}
                {...props}
            >
                <tspan>{name}</tspan>
            </Text>
        );
    }
});

export default Constant;
