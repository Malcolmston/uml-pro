import Interface from "@/public/components/interface/Interface";
import {MethodProps} from "@/public/components/Method";
import Visibility from "@/public/components/visibility";
import {type AnnotationElement, Props} from "@/public/components/annotation/properties";
import Types from "@/public/components/objects";

export default class Annotation extends Interface {
    // Store elements for annotation-specific handling
    elements: AnnotationElement[];

    constructor(props: Props) {
        // @ts-expect-error: Interface constructor does not accept 'type', but required for annotation
        super(props);
        this.setType = Types.ANNOTATION;

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

    /**
     * Removes an element from the elements list by its ID and removes associated methods.
     *
     * @param {string} elementId - The ID of the element to be removed.
     * @return {void} No value is returned.
     */
    removeElement(elementId: string): void {
        this.elements = this.elements.filter(el => el.id !== elementId);
        // Also remove from methods
        this.methods = this.methods.filter(method =>
            !this.elements.some(el => el.name === method.name)
        );
    }
}
