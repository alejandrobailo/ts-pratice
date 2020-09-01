// Project type
enum ProjectStatus {
	Active,
	Finished
}

// Project Sate Management
type Listener = (items: Project[]) => void;

class Project {
	constructor(
		public id: string,
		public title: string,
		public desc: string,
		public people: number,
		public status: ProjectStatus
	) {}
}

// Project State Management
class ProjectState {
	private listeners: Listener[] = [];
	private projects: Project[] = [];
	private static instance: ProjectState;

	constructor() {}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addListener(listenerFn: Listener) {
		this.listeners.push(listenerFn);
	}

	addProject(title: string, description: string, numOfPeople: number) {
		const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
		this.projects.push(newProject);
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(input: Validatable) {
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
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
	// console.log(descriptor);
	const originalMethod = descriptor.value;
	const adjDescriptor: PropertyDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		}
	};
	return adjDescriptor;
}

// Project list class
class ProjectList {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLElement;
	assignedProject: Project[];

	constructor(private type: 'active' | 'finished') {
		this.templateElement = <HTMLTemplateElement>document.getElementById('projects-list')!;
		this.hostElement = <HTMLDivElement>document.getElementById('app');
		this.assignedProject = [];
		const importedNode = document.importNode(this.templateElement.content, true);
		this.element = <HTMLElement>importedNode.firstElementChild;
		this.element.id = `${this.type}-projects`;

		projectState.addListener((projects: Project[]) => {
			this.assignedProject = projects;
			this.renderProjects();
		});

		this.attach();
		this.renderContent();
	}

	private renderProjects() {
		const listEl = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!;
		for (const item of this.assignedProject) {
			const listItem = document.createElement('li');
			listItem.textContent = item.title;
			listEl.appendChild(listItem);
		}
	}

	private renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' Projects';
	}

	private attach() {
		this.hostElement.insertAdjacentElement('beforeend', this.element);
	}
}

// Project input class
class ProjectInput {
	templateElement: HTMLTemplateElement;
	hostElement: HTMLDivElement;
	element: HTMLFormElement;
	titleIE: HTMLInputElement;
	peopleIE: HTMLInputElement;
	descriptionIE: HTMLInputElement;

	constructor() {
		this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
		this.hostElement = <HTMLDivElement>document.getElementById('app');

		const importedNode = document.importNode(this.templateElement.content, true);
		this.element = <HTMLFormElement>importedNode.firstElementChild;
		this.titleIE = <HTMLInputElement>this.element.querySelector('#title');
		this.peopleIE = <HTMLInputElement>this.element.querySelector('#people');
		this.descriptionIE = <HTMLInputElement>this.element.querySelector('#description');

		this.configure();
		this.attach();
	}

	private gatherUserInput(): [string, string, number] | undefined {
		const enteredTitle = this.titleIE.value;
		const enteredDescription = this.descriptionIE.value;
		const enteredPeople = this.peopleIE.value;

		const titleValidatable: Validatable = {
			value: enteredTitle,
			required: true
		};
		const descValidatable: Validatable = {
			value: enteredDescription,
			required: true,
			minLength: 5,
			maxLength: 23
		};
		const peopleValidatable: Validatable = {
			value: +enteredPeople,
			required: true,
			min: 1,
			max: 10
		};

		if (!validate(titleValidatable) || !validate(peopleValidatable) || !validate(descValidatable)) {
			alert('Invalid input, please try again!');
			return;
		} else {
			return [ enteredTitle, enteredDescription, +enteredPeople ];
		}
	}

	private clearInputs() {
		this.titleIE.value = '';
		this.descriptionIE.value = '';
		this.peopleIE.value = '';
	}

	@autobind
	private submitHandler(e: Event) {
		e.preventDefault();
		const userInput = this.gatherUserInput();
		if (Array.isArray(userInput)) {
			const [ title, desc, people ] = userInput;
			projectState.addProject(title, desc, people);
			console.log(title, desc, people);
			this.clearInputs();
		}
	}

	private configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	private attach() {
		this.hostElement.insertAdjacentElement('afterbegin', this.element);
	}
}
const pInput = new ProjectInput();
const pListActive = new ProjectList('active');
const pListFinished = new ProjectList('finished');
