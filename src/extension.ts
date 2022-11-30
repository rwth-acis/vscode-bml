import * as path from 'path';
import * as vscode from 'vscode';

import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient';

const main: string = 'i5.bml.langserver.BMLLangServerMain';
let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	let excecutable: string = path.join('/home/marc/.jdks/corretto-17.0.5', 'bin', 'java');

	let classPath = '/home/marc/bml/lang-server/build/libs/lang-server-0.1-SNAPSHOT.jar';
	const args: string[] = ['-cp', classPath];

	// Set the server options 
	// -- Run command: java -cp ./../bml-lang-server/bml-lang-server.jar i5.bml.langserver.BMLLangServerMain
	let serverOptions: ServerOptions = {
		command: excecutable,
		args: [...args, main],
		options: {}
	};

	let clientOptions: LanguageClientOptions = {
		// Register the server for bml documents
		documentSelector: [{ scheme: 'file', language: 'bml' }],
		synchronize: {
			// Synchronize the setting section 'bml-lang-server' to the server
			configurationSection: 'bmlLangServer',
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	client = new LanguageClient('bml-lang-server', 'BML Language Server', serverOptions, clientOptions);
	let disposable = client.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined { 
	if (!client) {
		return undefined;
	}

	return client.stop();
}
