## What is a Record

A record is a compact data carrier that bundles a name with a fixed set of parameters.
In this tool, records are shown as a specialized class type with a signature-style header.

A record object in this tool can represent these capabilities:

1. Record name with the `<<record>>` stereotype.
2. Record parameters displayed in the header signature.
3. Constructors and methods (optional).
4. Drag position and sizing (x/y placement and dynamic width).

### Record Parameters

Parameters are displayed in the record header as a signature and are not listed in the
standard parameters section. Type colors follow the same rules used by classes.

### Examples

#### Record (Java)

```java
public record User(String name, int age) {}
```

UML-style entry:
- `User(name: String, age: int)`

#### Record (TypeScript)

```ts
type User = {
    name: string;
    age: number;
};
```

UML-style entry:
- `User(name: string, age: number)`
