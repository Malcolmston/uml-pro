## What is a class

In any language, a class is an object factory.

A class object in this tool can represent these capabilities:

1. Class name and optional class type label:
   - `class` (default)
   - `abstract`
   - `interface`
   - `enumeration`
   - `annotation`
   - `record`
2. Properties (fields/parameters)
3. Constants (enum-style values or named constants)
4. Constructors
5. Methods
6. Auto-generated getters and setters (collapsible section)
7. Drag position and sizing (x/y placement and dynamic width)

### visibility modifiers

Visibility is displayed with UML-style symbols and maps to these options:

1. public `+`
2. private `-`
3. protected `#`
4. package `~`
5. default `*` (no keyword when exporting)


### parameter color

- <span style="color:#e67e22">■</span> `int`, `long`, `short`, `byte` (Orange)
- <span style="color:#1abc9c">■</span> `float`, `double` (Teal)
- <span style="color:#9b59b6">■</span> `char` (Purple)
- <span style="color:#e74c3c">■</span> `boolean` (Red)
- <span style="color:#3498db">■</span> `String`, `CharSequence`, `StringBuilder` (Blue)
- <span style="color:#2ecc71">■</span> `List`, `ArrayList`, `Set`, `Map`, `Queue` (Green)
- <span style="color:#f39c12">■</span> `BigInteger`, `BigDecimal`, `Number` (Gold)
- <span style="color:#00bcd4">■</span> `LocalDate`, `LocalDateTime`, `Date`, `Calendar` (Cyan)
- <span style="color:#8a9899">■</span> `InputStream`, `OutputStream`, `Reader`, `Writer` (Gray)
- <span style="color:#c0392b">■</span> `Thread`, `Runnable`, `ExecutorService` (Dark red)
- <span style="color:#737375">■</span> `void`, `null` (Light gray)
- <span style="color:#8e44ad">■</span> `Comparable`, `Serializable`, `Cloneable` (Violet)
- <span style="color:#ff6b6b">■</span> `Exception`, `IOException`, `RuntimeException` (Bright red)
- <span style="color:#f1c40f">■</span> `@Override`, `@Nullable`, `@Test` (Yellow)
- <span style="color:#b4b8b9ff">■</span> Default for unknown types

### parameter types

In addition to visibility and color, parameters can have specific modifiers:

1. **Static**: Represented with an <u>underline</u>.
2. **Final**: Represented by converting the name to **UPPERCASE** and replacing spaces with underscores (e.g., `MAX_VALUE`).

### Properties

Properties (fields) show the visibility symbol, name, and type. They can also be marked as static and/or final.

### Constants

Constants render a name and optional values list. They are commonly used for enum values, but can also represent named constants.

### Methods

Methods represent behaviors of the class. They have the following visual modifiers:

1. **Static**: Represented with an <u>underline</u>.
2. **Abstract**: Represented with *italic* text.
3. **Return type**: Shown after the parameter list.
4. **Default value**: Optional, shown as `default <value>`.

### Constructors

Constructors are special methods used to initialize objects.

1. **Static**: Represented with *italic* text.
2. **Abstract**: Represented with **bold** text.

### Examples

**Java**

```java
public class User {
    private static final int MAX_AGE = 120;
    private String name;
    private int age;

    public User(String name, int age) { ... }
    public String getName() { ... }
    public void setName(String name) { ... }
    public boolean isAdult() { ... }
}
```

UML-style entries:
- `- name: String`
- `- age: int`
- `+ User(name: String, age: int)`
- `+ getName(): String`
- `+ setName(value: String): void`
- `+ isAdult(): boolean`

**TypeScript**

```ts
export class ApiClient {
    private readonly baseUrl: string;
    private token?: string;

    constructor(baseUrl: string) { ... }
    public setToken(token: string): void { ... }
    public async fetchUser(id: number): Promise<User> { ... }
}
```

UML-style entries:
- `- BASE_URL: string` (final/readonly)
- `- token: string`
- `+ ApiClient(baseUrl: string)`
- `+ setToken(token: string): void`
- `+ fetchUser(id: int): Promise<User>`

**C++**

```cpp
class Point {
private:
    double x;
    double y;
public:
    Point(double x, double y);
    double distanceTo(const Point& other) const;
    static Point origin();
};
```

UML-style entries:
- `- x: double`
- `- y: double`
- `+ Point(x: double, y: double)`
- `+ distanceTo(other: Point): double`
- `+ origin(): Point` (static)
