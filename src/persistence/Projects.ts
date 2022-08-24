import { Data, Database } from "./Database"

export enum ProjectState {
    ACTIVE = "active",
    FINISHED = "finished"
 }

export class Project implements Data {
    constructor(
         readonly title: string,
         readonly description: string,
         readonly people: number,
         readonly state: ProjectState = ProjectState.ACTIVE
    ) {}

    validate() {
        if (!this.title) {
            throw new Error("Project must have a title")
        } else if (!this.description) {
            throw new Error("Project must have a description")
        } else if (isNaN(this.people) || this.people < 0) {
            throw new Error("Project must have a non-negative number of people")
        }
    }

    get id() {
        return this.title.toLowerCase()
    }
}

export class ProjectDatabase extends Database<Project> {
    private static INSTANCE: ProjectDatabase

    private constructor() {
        super()
    }

    static get() {
        if (!this.INSTANCE) {
            this.INSTANCE = new ProjectDatabase()
        }

        return this.INSTANCE
    }
}
