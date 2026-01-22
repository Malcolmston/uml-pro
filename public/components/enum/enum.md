## What is an Enumeration

An enumeration (enum) in this tool represents a special data type that enables for a variable to be a set of predefined constants.

An enumeration object in this tool can represent these capabilities:

1. Enum name with the `<<enumeration>>` stereotype.
2. Constants (the enum values)
3. Properties (fields/parameters)
4. Constructors
5. Methods
6. Drag position and sizing (x/y placement and dynamic width)

### visibility modifiers

Visibility is displayed with UML-style symbols:

1. public `+`
2. private `-`
3. protected `#`
4. package `~`
5. default `*`

### parameter color

Enumerations use the same type-based color coding as classes:

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

### Enum Constants

Constants are the primary members of an enumeration. They represent the fixed set of values.

1. **Naming**: Usually written in **UPPERCASE**.
2. **Values**: Optional arguments can be shown if the enum constants have associated data.

### Examples

#### Enumeration (Java)

```java
public enum Status {
    OPEN,
    IN_PROGRESS,
    CLOSED;
}
```

UML-style entries:
- `OPEN`
- `IN_PROGRESS`
- `CLOSED`

#### Enumeration with Fields (Java)

```java
public enum Plan {
    FREE(0),
    PRO(10),
    ENTERPRISE(100);

    private final int price;

    Plan(int price) {
        this.price = price;
    }

    public int getPrice() {
        return price;
    }
}
```

UML-style entries:
- `FREE(0)`
- `PRO(10)`
- `ENTERPRISE(100)`
- `- price: int`
- `+ Plan(price: int)`
- `+ getPrice(): int`

#### Enumeration (TypeScript)

```ts
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}
```

UML-style entries:
- `UP = "UP"`
- `DOWN = "DOWN"`
- `LEFT = "LEFT"`
- `RIGHT = "RIGHT"`
