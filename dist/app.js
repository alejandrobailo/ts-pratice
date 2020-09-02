"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// Project type
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
// Project Model
class Project {
    constructor(id, title, desc, people, status) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.people = people;
        this.status = status;
    }
}
// Class state
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
// Project State Management
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(input) {
    let isValid = true;
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length >= input.minLength;
    }
    if (input.maxLength != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length <= input.maxLength;
    }
    if (input.max != null && typeof input.value === 'number') {
        isValid = isValid && input.value <= input.max;
    }
    if (input.min != null && typeof input.value === 'number') {
        isValid = isValid && input.value >= input.min;
    }
    return isValid;
}
// Autobind decorator
function autobind(_, _2, descriptor) {
    // console.log(descriptor);
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
// Component Base class
class Component {
    constructor(templateId, hostElementId, insertBegin, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertBegin);
    }
    attach(position) {
        this.hostElement.insertAdjacentElement(position ? 'afterbegin' : 'beforeend', this.element);
    }
}
// Project list class
class ProjectList extends Component {
    constructor(type) {
        super('projects-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProject = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListener((projects) => {
            this.assignedProject = projects.filter((item) => {
                if (this.type === 'active') {
                    return item.status === ProjectStatus.Active;
                }
                return item.status === ProjectStatus.Finished;
            });
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' Projects';
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        for (const item of this.assignedProject) {
            const listItem = document.createElement('li');
            listItem.textContent = item.title;
            listEl.appendChild(listItem);
        }
    }
}
// Project input class
class ProjectInput extends Component {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.titleIE = this.element.querySelector('#title');
        this.peopleIE = this.element.querySelector('#people');
        this.descriptionIE = this.element.querySelector('#description');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }
    renderContent() { }
    gatherUserInput() {
        const enteredTitle = this.titleIE.value;
        const enteredDescription = this.descriptionIE.value;
        const enteredPeople = this.peopleIE.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true
        };
        const descValidatable = {
            value: enteredDescription,
            required: true,
            minLength: 5,
            maxLength: 23
        };
        const peopleValidatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 10
        };
        if (!validate(titleValidatable) || !validate(peopleValidatable) || !validate(descValidatable)) {
            alert('Invalid input, please try again!');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    clearInputs() {
        this.titleIE.value = '';
        this.descriptionIE.value = '';
        this.peopleIE.value = '';
    }
    submitHandler(e) {
        e.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            console.log(title, desc, people);
            this.clearInputs();
        }
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
const pInput = new ProjectInput();
const pListActive = new ProjectList('active');
const pListFinished = new ProjectList('finished');
