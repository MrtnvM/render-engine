import os from 'node:os'
import path from 'node:path'

const homeDir = os.homedir()

export const CLEAN_FLOW_ROOT_DIR = path.join(homeDir, '.render-engine')
export const CLEAN_FLOW_PROJECTS_DIR = path.join(CLEAN_FLOW_ROOT_DIR, 'projects')
