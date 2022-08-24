import { Class, Member } from "../../reflection/ReflectionTypes"
import { Registry } from "../../util/UtilityTypes"
import { State } from "../../state/StateManagement"
import { Component } from "../components/Component"

enum DragClass {
    DRAGGABLE = "draggable",
    DRAGGING = "dragging",
    DROP_AREA = "drop-area",
    DROPPABLE = "droppable"
}

interface UIElement {
    addEventListener: Member<typeof HTMLElement, "addEventListener">
    id: Member<typeof HTMLElement, "id">
    draggable: Member<typeof HTMLElement, "draggable">
    classList: Member<typeof HTMLElement, "classList">
}

type DropHandler<T extends UIElement> = { onDrop: (item: T) => void }

type DropHandlerElement<T extends UIElement> = UIElement & DropHandler<T>

type DropAreaDescriptor<T extends UIElement> = {
    element: DropHandlerElement<T>
    type: Class<T>
}

class DragAndDropBroker {
    private static INSTANCE: DragAndDropBroker

    static get() {
        if (!this.INSTANCE) {
            this.INSTANCE = new DragAndDropBroker()
        }

        return this.INSTANCE
    }

    private readonly _draggables: Registry<UIElement> = {}
    private readonly _dropAreas: Registry<DropAreaDescriptor<UIElement>> = {}
    private readonly _currentDraggable = new State<UIElement>()
    private readonly _currentDroppable = new State<UIElement>().withListeners(this._onDroppableChange.bind(this))

    private constructor() {
        window.addEventListener("dragenter", () => this._currentDroppable.delete())
    }

    registerDraggable(element: UIElement) {
        this._draggables[element.id] = element

        const context = this
        element.addEventListener("dragstart", function() { context.onDragStart(this) })
        element.addEventListener("dragend", function() { context.onDragEnd(this) })
        element.classList.add(DragClass.DRAGGABLE)
        element.draggable = true
    }

    registerDropArea<T extends UIElement>(element: DropHandlerElement<T>, type: Class<T>) {
        this._dropAreas[element.id] = { element: element as DropHandlerElement<UIElement>, type }

        const context = this
        element.addEventListener("dragover", event => event.preventDefault())
        element.addEventListener("drop", function() { context.onDrop(this) })
        element.addEventListener("dragenter", function(event: DragEvent) { context.onDragEnter(this, event) })
        element.classList.add(DragClass.DROP_AREA)
    }

    onDragStart(html: HTMLElement) {
        const element = this._draggables[html.id]
        if (element) {
            element.classList.add(DragClass.DRAGGING)
            this._currentDraggable.value = element
        }
    }

    onDragEnd(html: HTMLElement) {
        const element = this._draggables[html.id]
        if (element) {
            element.classList.remove(DragClass.DRAGGING)
            this._currentDraggable.delete()
        }
    }

    onDragEnter(html: HTMLElement, event: DragEvent) {
        const dropArea = this._dropAreas[html.id]
        if (dropArea) {
            this._currentDroppable.value = dropArea.element
            event.stopPropagation()
        }
    }

    onDrop(html: HTMLElement) {
        const dropArea = this._dropAreas[html.id]
        const draggable = this._currentDraggable.value
        if (dropArea && draggable && draggable instanceof dropArea.type) {
            dropArea.element.onDrop(draggable)
            this._currentDroppable.delete()
        }
    }

    private _onDroppableChange(newDroppable?: UIElement, oldDroppable?: UIElement) {
        oldDroppable?.classList.remove(DragClass.DROPPABLE)
        newDroppable?.classList.add(DragClass.DROPPABLE)
    }
}

export function Draggable<T extends Class<Component>>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args)
            DragAndDropBroker.get().registerDraggable(this)
        }
    }
}

export function DropArea<T extends UIElement>(type: Class<T>) {
    return function<U extends Class<UIElement> & Class<DropHandler<T>>>(constructor: U) {
        return class extends constructor {
            constructor(...args: any[]) {
                super(...args)
                DragAndDropBroker.get().registerDropArea(this, type)
            }
        }
    }
}
