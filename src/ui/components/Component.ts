export abstract class Component {
    protected readonly rootElement: HTMLElement

    constructor(templateId: string, instanceId: string) {
        const template = document.getElementById(templateId) as HTMLTemplateElement
        if (!template) {
            throw new Error("Invalid template ID: " + templateId)
        }

        const instance = document.importNode(template.content, true)
        this.rootElement = instance.firstElementChild as HTMLElement
        if (!this.rootElement) {
            throw new Error("Failed to instantiate template: " + templateId)
        }

        this.setId(instanceId)
    }

    render(hostElement: HTMLElement) {
        hostElement.appendChild(this.rootElement)
    }

    get id() {
        return this.rootElement.id
    }

    get addEventListener() {
        return this.rootElement.addEventListener.bind(this.rootElement)
    }

    get draggable() {
        return this.rootElement.draggable
    }

    set draggable(value: boolean) {
        this.rootElement.draggable = value
    }

    get classList() {
        return this.rootElement.classList
    }

    protected setId(id: string) {
        if (id.length < 1) {
            throw new Error("Tried to set element ID to empty string")
        }

        if (document.getElementById(id)) {
            throw new Error("Element ID already in use: " + id)
        }

        this.rootElement.id = id
    }

    protected getElementById<T extends HTMLElement = HTMLElement>(id: string): T {
        return this.getElementBySelector("#" + id)
    }

    protected getElementBySelector<T extends HTMLElement = HTMLElement>(selector: string): T {
        const element = this.rootElement.querySelector(selector)
        if (!element) {
            throw new Error("Failed to find element: " + selector)
        }

        return element as T
    }
}
