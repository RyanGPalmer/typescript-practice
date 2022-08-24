export interface Data {
    validate(): void
    get id(): string
}

export interface DatabaseListener<T> {
    onInsert(data: T): void
    onUpdate(data: T): void
}

export class Database<T extends Data> {
    private readonly _listeners: DatabaseListener<T>[] = []
    private readonly _data: T[] = []

    addListeners(...listeners: DatabaseListener<T>[]) {
        this._listeners.push(...listeners)
    }

    insert(data: T) {
        data.validate()
        this._ensureUniqueId(data.id)
        this._data.push(data)
        this._notifyListeners(data, "onInsert")
    }

    update(data: T) {
        data.validate()
        this._data[this._getIndex(data.id)] = data
        this._notifyListeners(data, "onUpdate")
    }

    private _getIndex(id: string) {
        return this._data.findIndex(d => d.id === id)
    }

    private _ensureUniqueId(id: string) {
        if (this._getIndex(id) >= 0) {
            throw new Error("Duplicate ID: " + id)
        }
    }

    private _notifyListeners(data: T, func: keyof DatabaseListener<T>) {
        this._listeners.forEach(listener => listener[func](data))
    }

    query(cKey?: keyof T, cVal?: unknown) {
        return this._data.filter(d => {
            return cKey == null || cVal == null || d[cKey] === cVal
        })
    }
}
