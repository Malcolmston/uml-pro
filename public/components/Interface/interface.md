## What is an Interface

An interface in this tool represents a contract that classes can implement. It defines a set of methods and constants without providing the implementation.

An interface object in this tool can represent these capabilities:

1. Interface name with the `<<interface>>` stereotype.
2. Constants (static final fields)
3. Methods (typically abstract, but can be default or static)
4. Constructors (rare but supported for certain languages/modeling needs)
5. Drag position and sizing (x/y placement and dynamic width)

## What is an Annotation

An annotation is a special type of interface used to provide metadata about code. In this tool, annotations are treated as specialized interfaces that focus on elements with default values.

An annotation object represents:

1. Annotation name with the `<<annotation>>` stereotype.
2. Elements (properties with optional default values)
3. Methods
4. Drag position and sizing

### Interface Methods

Methods in an interface represent the required behaviors.

1. **Abstract**: Usually represented with *italic* text (default for interfaces).
2. **Static**: Represented with an <u>underline</u>.
3. **Default**: Shown with `default` keyword or specific markers depending on the export language.

### Annotation Elements

Elements are the primary way to store data in an annotation.

1. **Type**: The data type of the element.
2. **Default Value**: Optional, shown as `default <value>`.

### Examples

#### Interface (Java)

```java
public interface Repository<T> {
    int MAX_PAGE_SIZE = 100;
    
    T findById(String id);
    List<T> findAll();
    void save(T entity);
    
    default void delete(T entity) {
        // default implementation
    }
}
```

UML-style entries:
- `+ MAX_PAGE_SIZE: int` (static final)
- `+ findById(id: String): T`
- `+ findAll(): List<T>`
- `+ save(entity: T): void`
- `+ delete(entity: T): void` (default)

#### Annotation (Java)

```java
public @interface Entity {
    String tableName() default "";
    boolean cacheable() default true;
    int version() default 1;
}
```

UML-style entries:
- `+ tableName: String = ""`
- `+ cacheable: boolean = true`
- `+ version: int = 1`

#### Interface (TypeScript)

```ts
interface Shape {
    readonly color: string;
    getArea(): number;
    getPerimeter?(): number;
}
```

UML-style entries:
- `+ COLOR: string` (readonly)
- `+ getArea(): number`
- `+ getPerimeter(): number` (optional)
