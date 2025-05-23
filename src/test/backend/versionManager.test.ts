import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { VersionManager } from '../../backend/versionManager';
import { Version } from '../../backend/types';

suite('VersionManager Tests', () => {
    let versionManager: VersionManager;
    let sandbox: sinon.SinonSandbox;
    const testFilePath = path.join(__dirname, 'testFile.txt');
    const testContent = 'This is a test file.';

    setup(async () => {
        // Create a sandbox for stubs
        sandbox = sinon.createSandbox();
        
        // Create a test file
        fs.writeFileSync(testFilePath, testContent);
        
        // Initialize version manager
        versionManager = new VersionManager();
    });

    teardown(() => {
        // Restore stubs
        sandbox.restore();
        
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    test('Should save version correctly', async () => {
        // Save a version
        const result = await versionManager.saveVersion(testFilePath);
        
        // Verify result
        assert.ok(result);
        assert.strictEqual(typeof result!.id, 'string');
        assert.strictEqual(result!.filePath, testFilePath);
    });

    test('Should get versions correctly', async () => {
        // Save multiple versions
        await versionManager.saveVersion(testFilePath, 'Version 1');
        await versionManager.saveVersion(testFilePath, 'Version 2');
        
        // Get versions
        const versions = versionManager.getVersions(testFilePath);
        
        // Verify result
        assert.strictEqual(versions.length, 2);
        assert.strictEqual(versions[0].description, 'Version 1');
        assert.strictEqual(versions[1].description, 'Version 2');
    });

    test('Should load version correctly', async () => {
        // Save a version
        const savedVersion = await versionManager.saveVersion(testFilePath);
        
        // Modify the test file
        fs.writeFileSync(testFilePath, 'Modified content');
        
        // Load the saved version
        const success = await versionManager.loadVersion(testFilePath, savedVersion!.id);
        
        // Verify result
        assert.strictEqual(success, true);
        
        // Verify file content is restored
        const content = fs.readFileSync(testFilePath, 'utf8');
        assert.strictEqual(content, testContent);
    });

    test('Should delete version correctly', async () => {
        // Save a version
        const savedVersion = await versionManager.saveVersion(testFilePath);
        
        // Delete the version
        const success = await versionManager.deleteVersion(testFilePath, savedVersion!.id);
        
        // Verify result
        assert.strictEqual(success, true);
        
        // Verify version is deleted
        const versions = versionManager.getVersions(testFilePath);
        assert.strictEqual(versions.length, 0);
    });
}); 