import Class from "@/public/components/class/Class";
import Props from "@/public/components/abstract/properties";
import Types from "@/public/components/objects";

export default class Abstract extends Class {
    constructor(props: Props) {
        super(props);

        this.setType = Types.ABSTRACT;
    }

    getType(): Types {
        return Types.ABSTRACT;
    }
}
