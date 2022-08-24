type StateListener<T> = (newValue: T | undefined, oldValue: T | undefined) => void

abstract class Property<T> {
    private _value: T | undefined

    get value(): T | undefined {
        return this._value
    }

    set value(newValue: T | undefined) {
        const oldValue = this._value
        if (newValue !== oldValue) {
            this._value = newValue
            this.onChange(newValue, oldValue)
        }
    }

    protected abstract onChange(newValue: T | undefined, oldValue: T | undefined): void
}

export class State<T> extends Property<T> {
    private readonly _listeners: StateListener<T>[] = []

    delete() {
        this.value = undefined
    }

    withListeners(...listeners: StateListener<T>[]) {
        this._listeners.push(...listeners)
        return this
    }

    protected override onChange(newValue: T | undefined, oldValue: T | undefined): void {
        this._listeners.forEach(l => l.call(l, newValue, oldValue))
    }
}
