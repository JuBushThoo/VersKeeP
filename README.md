# VersKeeP - VS Code Local Version Control

VersKeeP is a lightweight, local file version management system for VS Code that provides simple version control for individual files without requiring a full Git setup.

## Features

- Save versions of files with optional descriptions
- Restore previous versions with a single click
- Compare different versions using the built-in diff viewer
- View version history for the current file
- Right-click context menu integration
- Automatic version numbering

## How It Works

VersKeeP stores file versions in a `.versions` folder in your workspace. Each version is saved with metadata, allowing you to track changes and restore previous versions as needed.

## Usage

### Saving a Version

1. Right-click on a file in the explorer or editor
2. Select "VERSIONS" → "Save Version"
3. Optionally enter a description for the version

### Loading a Version

1. Right-click on a file in the explorer or editor
2. Select "VERSIONS" → "Load Version"
3. Select the version you want to restore

### Viewing Versions

1. Right-click on a file in the explorer or editor
2. Select "VERSIONS" → "View All Versions"
3. A tree view will show all saved versions

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/verskeep.git
cd verskeep

# Install dependencies
npm install

# Open in VS Code
code .
```

### Running the Extension

1. Press F5 to start a new VS Code window with the extension loaded
2. Open a folder to test with
3. Try saving and loading versions

### Building

```bash
# Package the extension
npm run package
```

### Testing

```bash
# Run tests
npm test
```

## Project Structure

- `src/backend`: Version control system logic
- `src/frontend`: UI components and VS Code integration
- `src/utils`: Shared utilities
- `src/test`: Unit and integration tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# VersKeeP
