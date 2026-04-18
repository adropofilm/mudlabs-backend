import fs from 'fs'
import path from 'path'

const DB_DIR = path.join(__dirname, 'data')

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true })
}

/**
 * Read data from JSON database file
 */
export async function readDB<T>(collection: string): Promise<T[]> {
  const filePath = path.join(DB_DIR, `${collection}.json`)

  try {
    if (!fs.existsSync(filePath)) {
      return []
    }

    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) as T[]
  } catch (error) {
    console.error(`Error reading ${collection}.json:`, error)
    return []
  }
}

/**
 * Write data to JSON database file
 */
export async function writeDB<T>(collection: string, data: T[]): Promise<void> {
  const filePath = path.join(DB_DIR, `${collection}.json`)

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${collection}.json:`, error)
    throw error
  }
}
