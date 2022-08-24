import { Component } from "./Component"
import { ProjectDatabase, Project, ProjectState } from "../../persistence/Projects"
import { DatabaseListener } from "../../persistence/Database"
import { Draggable, DropArea } from "../dragdrop/DragAndDrop"

export class ProjectInput extends Component {
    private readonly _titleInput: HTMLInputElement
    private readonly _descriptionInput: HTMLTextAreaElement
    private readonly _peopleInput: HTMLInputElement

    constructor() {
        super("project-input", "user-input")
        this._titleInput = this.getElementById("title")
        this._descriptionInput = this.getElementById("description")
        this._peopleInput = this.getElementById("people")
        this.getElementBySelector("button").addEventListener("click", this.onSubmit.bind(this))
    }

    onSubmit(event: Event) {
        event.preventDefault()
        try {
            ProjectDatabase.get().insert(this.getProjectDataFromInputs())
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message)
            } else {
                throw error
            }
        }
    }

    private getProjectDataFromInputs() {
        return new Project(this.title, this.description, this.people)
    }

    get title() {
        return this._titleInput.value?.trim()
    }

    get description() {
        return this._descriptionInput.value?.trim()
    }

    get people() {
        return this._peopleInput.valueAsNumber
    }
}

@Draggable
class ProjectListItem extends Component {
    constructor(readonly project: Project) {
        super("single-project", `project-${project.title.toLowerCase().replace(/[^a-z]+/gi, "")}-${project.state}`)
        this.getElementBySelector("h2").innerText = project.title
        this.getElementBySelector("h3").innerText = this.peopleText
        this.getElementBySelector("p").innerText = project.description
    }

    get peopleText() {
        if (this.project.people === 1) {
            return "1 person"
        } else {
            return `${this.project.people} people`
        }
    }
}

@DropArea(ProjectListItem)
export class ProjectList extends Component implements DatabaseListener<Project> {
    private readonly _listElement: HTMLUListElement

    constructor(readonly state: ProjectState) {
        super("project-list", state + "-projects")
        this._listElement = this.getElementBySelector("ul")
        this.getElementBySelector("h2").innerText = state.toString().toUpperCase()
    }

    override render(hostElement: HTMLElement) {
        this._renderProjects()
        super.render(hostElement)
    }

    onDrop(item: ProjectListItem) {
        const p = item.project
        ProjectDatabase.get().update(new Project(p.title, p.description, p.people, this.state))
    }

    onInsert() {
        this._renderProjects()
    }

    onUpdate() {
        this._renderProjects()
    }

    private _renderProjects() {
        this._listElement.replaceChildren()
        this._getProjects().forEach(this._renderProject.bind(this))
    }

    private _getProjects() {
        return ProjectDatabase.get().query("state", this.state)
    }

    private _renderProject(project: Project) {
        new ProjectListItem(project).render(this._listElement)
    }
}
