/**
 * Extension identifier
 */
export const EXTENSION_ID = 'verskeep';

/**
 * Extension display name
 */
export const EXTENSION_NAME = 'VersKeeP';

/**
 * Command namespace prefix
 */
export const COMMAND_PREFIX = `${EXTENSION_ID}.`;

/**
 * Commands
 */
export const COMMANDS = {
    SAVE_VERSION: `${COMMAND_PREFIX}saveVersion`,
    LOAD_VERSION: `${COMMAND_PREFIX}loadVersion`,
    DELETE_VERSION: `${COMMAND_PREFIX}deleteVersion`,
    VIEW_VERSIONS: `${COMMAND_PREFIX}viewVersions`,
    TREE_VIEW_LOAD_VERSION: `${COMMAND_PREFIX}treeView.loadVersion`,
    TREE_VIEW_DELETE_VERSION: `${COMMAND_PREFIX}treeView.deleteVersion`
};

/**
 * View identifiers
 */
export const VIEWS = {
    VERSIONS_VIEW: `${EXTENSION_ID}VersionsView`
};

/**
 * Version file name format
 */
export const VERSION_FILE_FORMAT = '{filename}.{versionId}';

/**
 * Metadata file name format
 */
export const METADATA_FILE_FORMAT = '{filename}.metadata.json';

/**
 * Default version directory name
 */
export const DEFAULT_VERSIONS_DIR = '.versions';

/**
 * Default version prefix
 */
export const DEFAULT_VERSION_PREFIX = 'v';

/**
 * Configuration section name
 */
export const CONFIG_SECTION = EXTENSION_ID;

/**
 * Configuration settings
 */
export const CONFIG = {
    VERSIONS_DIR: 'versionsDirectory',
    MAX_VERSIONS: 'maxVersionsPerFile',
    AUTO_SAVE: 'autoSaveOnChange',
    VERSION_FORMAT: 'versionFormat'
};
