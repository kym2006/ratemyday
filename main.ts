import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TAbstractFile, Vault} from 'obsidian';

// Remember to rename these classes and interfaces!

interface RateMyDay {
	mySetting: string;
}


// this is an async function which takes in a string and returns a number, using the chatgpt api
async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}


export default class MyPlugin extends Plugin {


	async onload() {


		// This creates an icon in the left ribbon.

		// Perform additional things with the ribbon

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');
		
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-list-view',
			name: 'Open List View',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'rate-current-note',
			name: 'Rate current note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				// get the content of the entire note
				// get the current line
				// get the current selection
				
				const files = this.app.vault.getMarkdownFiles();
				// make a map of the filename to the file
				const fileMap = new Map();
				for (const file of files) {
					fileMap.set(file.basename, file);
				}
				let text = view.getViewData();
				query({ inputs: text }).then((result) => {
					
					let res = result[0][0].label;
					let intensity = result[0][0].score;
					let emoji = "";
					// set the emoji based on the emotion as well as the intensity, using a 3 emojis for each emotion
					if (res == "positive") {
						if (intensity < 0.33) {
							emoji = "😊";
						} else if (intensity < 0.66) {
							emoji = "😁";
						} else {
							emoji = "😄";
						}
					} else if (res == "neutral") {
						if (intensity < 0.33) {
							emoji = "😐";
						} else if (intensity < 0.66) {
							emoji = "😑";
						} else {
							emoji = "😶";
						}
					} else {
						if (intensity < 0.33) {
							emoji = "😞";
						} else if (intensity < 0.66) {
							emoji = "😔";
						} else {
							emoji = "😢";
						}
					}
					// change the file name to append the emoji at the end
					let filename = view.file?.basename;
					let initial = filename;
					// delete all  emojis in the filename
					// check if the last character of the string is an emoji. if so, delete it.
					const regex = /\p{Extended_Pictographic}/ug
					filename = filename?.replace(regex, "");
					
					let newFilename = filename?.split(".")[0] + " " + emoji + ".md";
					// get the file
					let file = fileMap.get(initial);

					// rename the file
					this.app.vault.rename(file, newFilename);
					// update the map
					// save the file
					
				});
			}
		});

	}

	onunload() {

	}


}

class SampleModal extends Modal {
	// make a modal that is a calendar

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		// make a Calendar in grid format
		const files = this.app.vault.getMarkdownFiles();

		let display = [];
		const regex = /\p{Extended_Pictographic}/ug
		for (const file of files) {
			
			let filename = file.basename;
			// check if filename matches regex
			if (regex.test(filename)) {
				// if so add this file to the list of display files
				display.push(file);
			}
		}
		// sort the files by date
		display.sort((a, b) => {
			return a.stat.mtime - b.stat.mtime;
		});
		// display the files
		let res = "";
		for(const file of display) {
			let filename = file.basename;
			let date = file.stat.mtime;
			let emoji = filename.match(regex);
			filename = filename.replace(regex, "")
			contentEl.createEl("h1", {text: filename + "-" + emoji});
		}

	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
/*

class SampleSettingTab extends PluginSettingTab {
	plugin: RateMyDay;

	constructor(app: App, plugin: RateMyDay) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
	}
}
*/