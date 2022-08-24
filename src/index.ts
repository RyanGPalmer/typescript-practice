import { ProjectInput, ProjectList } from "./ui/components/ProjectComponents"
import { ProjectDatabase, ProjectState, Project } from "./persistence/Projects"

const projectInput = new ProjectInput()
const activeProjects = new ProjectList(ProjectState.ACTIVE)
const finishedProjects = new ProjectList(ProjectState.FINISHED)

ProjectDatabase.get().addListeners(activeProjects, finishedProjects)
ProjectDatabase.get().insert(new Project("Example Project", "This is just an example to use for testing while you develop the UI and business logic of the application.", 12))

const appElement = document.getElementById("app")!
projectInput.render(appElement)
activeProjects.render(appElement)
finishedProjects.render(appElement)
