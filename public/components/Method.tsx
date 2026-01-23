import {ConstructorProps} from "@/public/components/Constructor";
import {forwardRef} from "react";
import Visibility from "./visibility";
import {Text} from "./Svg";
import {tokenizeAndColorType} from "@/public/components/type_color";
import React from "react";


export type MethodProps = {
    returnType: string;
    defaultValue?: string;
    visibility?: Visibility;
    isDefault?: boolean;
} & Omit<ConstructorProps, 'vis'>;

/**
 * A React functional component that renders a stylized representation of a method signature.
 * This component uses SVG text elements to visually describe method properties such as
 * visibility, name, parameters, and return type.
 *
 * It supports various customization options like rendering the method as abstract or static,
 * and allows specifying default values for the method.
 *
 * @typedef {Object} MethodProps
 * @property {Visibility} [visibility=Visibility.PRIVATE] - The visibility level of the method (e.g., public, private, protected).
 * @property {string} name - The name of the method.
 * @property {string} returnType - The return type of the method.
 * @property {Array.<{name: string, type: string}>} params - An array of parameter objects, where each object specifies the parameter's name and type.
 * @property {boolean} [isStatic=false] - Indicates whether the method is static.
 * @property {boolean} [isAbstract=false] - Indicates whether the method is abstract.
 * @property {string} [defaultValue] - The default value for the method, if applicable.
 * @property {number} x - The x-coordinate for positioning the SVG text.
 * @property {number} y - The y-coordinate for positioning the SVG text.
 * @property {number} [fontSize] - The font size of the text.
 * @property {string} [fill] - The fill color of the text.
 *
 * @param {MethodProps} props - The props object containing method description and customization options.
 * @param {React.Ref<SVGTextElement>} ref - A React ref to the underlying SVG text element.
 *
 * @returns {JSX.Element} A JSX element that visually represents the method signature.
 */
const Method = forwardRef<SVGTextElement, MethodProps & {
    x: number;
    y: number;
    fontSize?: number;
    fill?: string;
}>(function Method(
    {
        visibility = Visibility.PRIVATE,
        name,
        returnType,
        params,
        isStatic = false,
        isAbstract = false,
        isDefault,
        defaultValue,
        ...props
    },
    ref
) {
    void isDefault;
    // Get visibility symbol/text
    const visibilitySymbol = visibility; // Assuming Visibility enum provides the symbols

    return (
        <Text
            ref={ref}
            {...props}
            fontStyle={isAbstract ? "italic" : "normal"}
            textDecoration={isStatic ? "underline" : "none"}
        >
            <tspan>{visibilitySymbol} {name}(</tspan>
            {(params || []).map((param, i) => (
                <React.Fragment key={i}>
                    {i > 0 && <tspan>, </tspan>}
                    <tspan>{param.name}</tspan>
                    {tokenizeAndColorType(`: ${param.type}`).map((token, tokenIndex) => (
                        <tspan key={`${i}-${tokenIndex}`} fill={token.props.fill}>
                            {token.props.children}
                        </tspan>
                    ))}
                </React.Fragment>
            ))}
            <tspan>)</tspan>
            {tokenizeAndColorType(`: ${returnType}`).map((token, tokenIndex) => (
                <tspan key={`return-${tokenIndex}`} fill={token.props.fill}>
                    {token.props.children}
                </tspan>
            ))}
            {defaultValue && <tspan> default {defaultValue}</tspan>}
        </Text>
    );
});

export default Method;
