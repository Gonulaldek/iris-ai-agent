# IRIS AI Agent

IRIS is a local TypeScript-based agent prototype designed to route user commands into controlled tools such as file reading, file writing, directory listing, text search, package inspection, and basic shell execution.

The project focuses on building a small but modular command-routing system instead of relying only on direct hard-coded commands. It is developed as a personal learning project to practice TypeScript, tool-based architecture, rule-based safety checks, and CLI-style automation workflows.

## Project Status

**Status:** Active Development

This project is still being improved. The current version focuses on local tool routing, file operations, command handling, rule checks, output formatting, and basic automation behavior.

## Features

- Rule-based command routing
- File reading and writing tools
- Directory listing
- Text search inside project files
- `package.json` inspection
- Basic shell command execution
- Safety checks for risky commands
- Profile-based output formatting
- Modular tool registry structure
- CLI-style interaction flow

## Technologies

- TypeScript
- Node.js
- Git / GitHub
- VS Code
- Command-line interface logic

## Why I Built This

I built this project to understand how local agent-like systems can be structured without depending entirely on an external AI model.

The main idea is to separate user intent, routing logic, available tools, safety rules, and formatted output into different parts of the project. This makes the system easier to understand, test, and expand.

## How It Works

The basic flow of the system is:

```txt
User Input
   ↓
Router / Rule Logic
   ↓
Tool Selection
   ↓
Safety Check
   ↓
Tool Execution
   ↓
Formatted Output
```

The agent can decide which internal tool should handle a command. For example, a command may be routed to file reading, directory listing, text searching, or shell execution depending on the detected intent.

## Project Structure

```txt
iris-ai-agent/
├── src/
│   ├── core/
│   ├── model/
│   ├── policy/
│   ├── tools/
│   ├── utils/
│   └── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md
```

> The folder names may change as the project develops.

## Installation

Clone the repository:

```bash
git clone https://github.com/Gonulaldek/iris-ai-agent.git
```

Go into the project folder:

```bash
cd iris-ai-agent
```

Install dependencies:

```bash
npm install
```

## Running the Project

Run the development command:

```bash
npm run dev
```

If the project is configured differently, check the scripts section inside `package.json`.

## Example Use Cases

IRIS is designed to support local development tasks such as:

- Reading a file from the workspace
- Listing files in a project folder
- Searching text inside project files
- Inspecting `package.json`
- Running safe shell commands
- Formatting command output based on the selected user profile

## Safety Notes

This project includes basic safety logic for risky shell commands and invalid tool parameters.

The goal is not to create an unrestricted command executor. The goal is to build a controlled local automation prototype where tools are routed through a rule layer.

Examples of risky actions that should be restricted:

- Dangerous delete commands
- Empty file paths
- System-level destructive commands
- Invalid shell operations
- Unsafe workspace access

## What I Learned

While building this project, I practiced:

- TypeScript project structure
- Node.js file system operations
- CLI-style command handling
- Tool registry design
- Rule-based safety checks
- Output formatting
- GitHub repository organization
- Building a project with modular architecture

## Next Improvements

Planned improvements include:

- Better command parsing
- More stable router logic
- Improved error messages
- More tool definitions
- Cleaner profile management
- Test cases for tools and rules
- Optional AI model integration for intent detection

## Notes

This is a personal learning and portfolio project. It is not intended to be a production-ready AI agent. The current goal is to demonstrate software architecture thinking, TypeScript practice, and local automation logic.

## Author

**Melih Gönülal**  
Junior Software Developer Candidate

- GitHub: [Gonulaldek](https://github.com/Gonulaldek)
- LinkedIn: [melihgonulal](https://linkedin.com/in/melihgonulal)
