import * as fs from 'fs';
import * as net from 'net';
import * as child_process from "child_process";
import * as vscode from 'vscode';

import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	function createServer(): Promise<StreamInfo> {
		return new Promise((resolve, reject) => {
			var server = net.createServer((socket) => {
				console.log("Creating server");

				resolve({
					reader: socket,
					writer: socket
				});

				socket.on('end', () => console.log("Disconnected"));
			}).on('error', (err) => {
				// TODO: handle errors
				throw err;
			});

			let javaExecutablePath = '/home/marc/.jdks/corretto-17.0.5/bin/java';

			server.listen(42069, () => {
				let options = { cwd: vscode.workspace.rootPath };

				let args = [
					'-jar',
					'/home/marc/bml/lang-server/build/libs/lang-server-0.1-SNAPSHOT.jar'
				]

				// Start the child java process
				let process = child_process.spawn(javaExecutablePath, args, options);

				let logFile = '/home/marc/bml/lang-server/build/libs/bml-lang-server.log';
				let logStream = fs.createWriteStream(logFile, { flags: 'w' });

				process.stdout.pipe(logStream);
				process.stderr.pipe(logStream);

				console.log(`Storing log in '${logFile}'`);
			});
		});
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

	client = new LanguageClient('bml-lang-server', 'BML Language Server', createServer, clientOptions);
	let disposable = client.start();
}

// this method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined { 
	if (!client) {
		return undefined;
	}

	return client.stop();
}
