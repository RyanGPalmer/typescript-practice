type Properties = { [key: PropertyKey]: any }
type Constructor<T> = { new(...args: any[]): T }
type Prototype = { prototype: Properties }
export type Class<T> = Constructor<T> & Prototype
export type Member<T extends Class<any> & Prototype, U extends keyof T["prototype"]> = T["prototype"][U]
