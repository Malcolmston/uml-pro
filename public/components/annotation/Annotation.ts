import Interface from "@/public/components/Interface/Interface";
import {AnnotationElement} from "@/public/components/annotation/properties";
import Props from "@/public/components/abstract/properties";
import {MethodProps} from "@/public/components/Method";
import Visibility from "@/public/components/visibility";

export default class Annotation extends Interface {
    // Store elements for annotation-specific handling
    elements: AnnotationElement[];

    constructor(props: Props) {
        // @ts-expect-error: Interface constructor does not accept 'type', but required for annotation
        super({...props, type: Types.ANNOTATION});

        // Convert elements to methods for the parent Interface class
        this.elements = props.elements || [];

        // Convert annotation elements to methods if elements are provided
        if (props.elements && props.elements.length > 0) {
            const elementMethods: MethodProps[] = props.elements.map(element => ({
                name: element.name,
                returnType: element.type,
                defaultValue: element.defaultValue,
                visibility: Visibility.PUBLIC,
                isAbstract: true,
                params: [] // Annotation elements have no parameters
            }));

            // Merge with any existing methods
            this.methods = [...(props.methods || []), ...elementMethods];
        }
    }

    /**
     * Retrieves a list of annotation elements.
     *
     * @return {AnnotationElement[]} An array of annotation elements.
     */
    getElements(): AnnotationElement[] {
        return this.elements;
    }

    /**
     * Adds an annotation element to the current instance and creates a corresponding method for consistency.
     *
     * @param {AnnotationElement} element - The annotation element to be added. It contains properties such as name, type, and default value.
     * @return {void} No return value.
     */
    addElement(element: AnnotationElement): void {
        this.elements.push(element);

        // Also add as a method for consistency with parent class
        const method: MethodProps = {
            name: element.name,
            returnType: element.type,
            defaultValue: element.defaultValue,
            visibility: Visibility.PUBLIC,
            isAbstract: true,
            params: []
        };

        this.methods.push(method);
    }
}
